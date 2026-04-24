from datetime import datetime
from beanie import Document
from pydantic import Field

class Contact(Document):
    name: str
    email: str
    company: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contacts"
