"""WebSocket endpoint for live exam sessions."""

import os
import base64
import logging
import time
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.models.session import ExamSession
from backend.services.ws_manager import manager
from backend.services.proctor_service import check_disqualify

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])

WEBCAM_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "webcam")
os.makedirs(WEBCAM_DIR, exist_ok=True)


@router.websocket("/ws/{session_id}")
async def ws_endpoint(ws: WebSocket, session_id: str):
    await manager.connect(session_id, ws)
    logger.info("WS connected: %s", session_id)

    last_code_save = 0

    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type", "")

            session = await ExamSession.find_one(ExamSession.session_id == session_id)
            if not session or session.status != "active":
                await ws.send_json({"type": "error", "message": "Session not active"})
                continue

            if msg_type == "heartbeat":
                pass  # connection keepalive

            elif msg_type == "proctor_event":
                event = {
                    "event": data.get("event", "unknown"),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "severity": data.get("severity", "low"),
                    "gap_seconds": data.get("gap_seconds", 0),
                    "duration_seconds": data.get("duration_seconds", 0),
                }
                session.proctor_log.append(event)
                await session.save()
                await check_disqualify(session_id, data.get("event", ""))

            elif msg_type == "code_change":
                now = time.time()
                if now - last_code_save > 5:
                    snapshot = {
                        "question_id": data.get("question_id", ""),
                        "code": data.get("code", ""),
                        "language": data.get("language", "python"),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                    session.code_snapshots.append(snapshot)
                    await session.save()
                    last_code_save = now

            elif msg_type == "answer_update":
                qid = data.get("question_id", "")
                answer = data.get("answer", "")
                if qid:
                    session.answers[qid] = answer
                    await session.save()

            elif msg_type == "webcam_snapshot":
                b64 = data.get("image", "")
                if b64:
                    try:
                        img_data = base64.b64decode(b64.split(",")[-1])
                        ts = int(time.time())
                        fname = f"{session_id}_{ts}.jpg"
                        fpath = os.path.join(WEBCAM_DIR, fname)
                        with open(fpath, "wb") as f:
                            f.write(img_data)
                        session.webcam_snapshots.append(f"/uploads/webcam/{fname}")
                        await session.save()
                    except Exception as e:
                        logger.error("Webcam save error: %s", e)

    except WebSocketDisconnect:
        logger.info("WS disconnected: %s", session_id)
    except Exception as e:
        logger.error("WS error for %s: %s", session_id, e)
    finally:
        manager.disconnect(session_id)
