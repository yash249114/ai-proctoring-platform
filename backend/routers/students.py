"""Student authentication and dashboard routes."""

import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt
import bcrypt
from bson import ObjectId

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from models.student import Student
from models.assessment import Assessment

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/student", tags=["Student"])



class LoginBody(BaseModel):
    username: str
    password: str


def _create_token(sub: str, role: str, student_id: str, company_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": sub, "role": role, "student_id": student_id, "company_id": company_id, "exp": exp},
        JWT_SECRET, algorithm=JWT_ALGORITHM,
    )


security = HTTPBearer()

def _get_student_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "student":
            raise HTTPException(403, "Student access required")
        return payload["student_id"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


@router.post("/login")
async def login(body: LoginBody):
    student = await Student.find_one(Student.college_id == body.username)
    if not student or not bcrypt.checkpw(body.password.encode('utf-8'), student.hashed_password.encode('utf-8')):
        raise HTTPException(401, "Invalid credentials")
    token = _create_token(student.college_id, "student", str(student.id), student.company_id)
    return {
        "token": token, "role": "student", "student_id": str(student.id),
        "name": student.name, "email": student.email, "college_id": student.college_id,
        "assigned_assessments": student.assigned_assessments,
    }


@router.get("/dashboard")
async def dashboard(sid: str = Depends(_get_student_id)):
    student = await Student.get(ObjectId(sid))
    if not student:
        raise HTTPException(404, "Student not found")
    assessments = []
    for aid in student.assigned_assessments:
        try:
            a = await Assessment.get(ObjectId(aid))
            if a:
                assessments.append({
                    "id": str(a.id), "title": a.title, "description": a.description,
                    "duration_minutes": a.duration_minutes, "status": a.status,
                    "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                    "question_types": a.question_types,
                })
        except Exception:
            pass
    return {"student_name": student.name, "assessments": assessments}
