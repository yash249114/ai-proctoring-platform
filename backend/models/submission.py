"""Submission model — final graded result for an exam session."""

from datetime import datetime, timezone
from beanie import Document


class Submission(Document):
    session_id: str
    student_id: str
    assessment_id: str
    company_id: str
    submitted_at: datetime = datetime.now(timezone.utc)
    total_score: float = 0.0
    per_question_scores: dict = {}
    time_taken_minutes: int = 0
    proctoring_summary: dict = {}  # {total_violations, tab_switches, phone_detected, away_count}

    class Settings:
        name = "submissions"
