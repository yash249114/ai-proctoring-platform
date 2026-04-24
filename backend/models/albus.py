"""Albus (Super Admin) model."""

from beanie import Document


class Albus(Document):
    email: str
    hashed_password: str
    role: str = "albus"

    class Settings:
        name = "albus"
