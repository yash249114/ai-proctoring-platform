"""Question model — supports coding + MCQ types."""

from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document


class Question(Document):
    company_id: str
    type: str  # "coding" / "aptitude" / "reasoning" / "verbal" / "maths" / "custom"
    title: str
    description: str
    constraints: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    explanation: Optional[str] = None
    options: Optional[List[str]] = None  # for MCQ types
    correct_answer: Optional[str] = None
    image_url: Optional[str] = None
    difficulty: str = "medium"  # "easy" / "medium" / "hard"
    tags: List[str] = []
    source_url: Optional[str] = None
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "questions"
