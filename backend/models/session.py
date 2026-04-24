"""Exam Session model — tracks a student's live exam."""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from beanie import Document


class ExamSession(Document):
    session_id: str  # uuid4
    student_id: str
    assessment_id: str
    company_id: str
    status: str = "active"  # "active" / "submitted" / "disqualified"
    start_time: datetime = datetime.now(timezone.utc)
    end_time: Optional[datetime] = None
    answers: Dict[str, str] = {}  # question_id -> answer
    code_snapshots: List[dict] = []
    proctor_log: List[dict] = []  # {event, timestamp, severity}
    webcam_snapshots: List[str] = []  # file paths
    violation_count: int = 0
    ai_feedback: dict = {}
    auto_submitted: bool = False
    disqualified: bool = False
    disqualify_reason: Optional[str] = None

    class Settings:
        name = "exam_sessions"
