"""Assessment model."""

from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document


class Assessment(Document):
    company_id: str
    title: str
    description: str = ""
    question_ids: List[str] = []
    duration_minutes: int = 60
    status: str = "draft"  # "draft" / "active" / "completed"
    created_at: datetime = datetime.now(timezone.utc)
    scheduled_at: Optional[datetime] = None
    question_types: List[str] = []

    class Settings:
        name = "assessments"
