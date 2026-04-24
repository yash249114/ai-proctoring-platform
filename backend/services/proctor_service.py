"""Proctoring service — checks violation thresholds and triggers disqualification."""

import logging
from datetime import datetime, timezone

from models.session import ExamSession
from services.ws_manager import manager

logger = logging.getLogger(__name__)

# ── Disqualification thresholds ──
MAX_TAB_SWITCHES = 5
MAX_PHONE_DETECTIONS = 3
MAX_FACE_AWAY_SECONDS = 15
TAB_AWAY_THRESHOLD_SECONDS = 10


async def check_disqualify(session_id: str, event_type: str):
    """
    Check if a proctoring event should trigger disqualification.
    Rules:
      1. Tab switches: >5 tab_switch events where student was away >10s → disqualify
      2. Phone detected: >3 phone_detected events → disqualify
      3. Face away: >15s consecutive face_away → disqualify
    """
    session = await ExamSession.find_one(ExamSession.session_id == session_id)
    if not session or session.status != "active":
        return

    log = session.proctor_log
    reason = None

    # Count violations by type
    tab_switches = sum(1 for e in log if e.get("event") == "tab_switch")
    phone_events = sum(1 for e in log if e.get("event") == "phone_detected")
    face_away_events = [e for e in log if e.get("event") == "face_away"]

    # Rule 1: Tab switches
    if tab_switches > MAX_TAB_SWITCHES:
        # Check if any tab switch had gap >10s
        long_switches = sum(1 for e in log if e.get("event") == "tab_switch" and e.get("gap_seconds", 0) > TAB_AWAY_THRESHOLD_SECONDS)
        if long_switches > 0:
            reason = f"Exceeded tab switch limit ({tab_switches} switches with extended absence)"

    # Rule 2: Phone detected
    if not reason and phone_events > MAX_PHONE_DETECTIONS:
        reason = f"Phone detected {phone_events} times during assessment"

    # Rule 3: Face away consecutive
    if not reason and face_away_events:
        last = face_away_events[-1]
        duration = last.get("duration_seconds", 0)
        if duration > MAX_FACE_AWAY_SECONDS:
            reason = f"Face away for {duration}s (limit: {MAX_FACE_AWAY_SECONDS}s)"

    if reason:
        # Disqualify
        session.disqualified = True
        session.status = "disqualified"
        session.disqualify_reason = reason
        session.end_time = datetime.now(timezone.utc)
        await session.save()

        await manager.send_json(session_id, {
            "type": "disqualified",
            "reason": reason,
        })
        logger.warning("Session %s DISQUALIFIED: %s", session_id, reason)
    else:
        # Update violation count and send warning
        total_violations = tab_switches + phone_events + len(face_away_events)
        session.violation_count = total_violations
        await session.save()

        warning_msg = None
        if event_type == "tab_switch":
            remaining = MAX_TAB_SWITCHES - tab_switches
            warning_msg = f"Warning: Tab switch detected. {remaining} switches remaining before disqualification."
        elif event_type == "phone_detected":
            remaining = MAX_PHONE_DETECTIONS - phone_events
            warning_msg = f"Warning: Phone detected. {remaining} detections remaining."
        elif event_type == "face_away":
            warning_msg = "Warning: Please keep your face visible to the webcam."
        elif event_type == "fullscreen_exit":
            warning_msg = "Warning: Fullscreen exited. Please stay in fullscreen mode."

        if warning_msg:
            await manager.send_json(session_id, {
                "type": "warning",
                "violation_count": total_violations,
                "message": warning_msg,
            })
