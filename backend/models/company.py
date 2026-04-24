"""Company (Host) model."""

from datetime import datetime, timezone
from beanie import Document


class Company(Document):
    company_name: str
    email: str
    hashed_password: str
    role: str = "company"
    is_verified: bool = False
    is_email_verified: bool = False
    otp: str | None = None
    otp_expiry: datetime | None = None
    registered_at: datetime = datetime.now(timezone.utc)
    terms_accepted: bool = False
    assessment_count: int = 0
    active_students: int = 0

    class Settings:
        name = "companies"
