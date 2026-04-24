from datetime import datetime
from beanie import Document
from pydantic import Field
from typing import Optional

class Report(Document):
    email: str
    issue_type: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reports"
