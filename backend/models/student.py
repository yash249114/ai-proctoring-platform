"""Student model."""

from typing import List
from beanie import Document


class Student(Document):
    name: str
    email: str
    college_id: str
    hashed_password: str
    role: str = "student"
    company_id: str = ""
    assigned_assessments: List[str] = []

    class Settings:
        name = "students"
