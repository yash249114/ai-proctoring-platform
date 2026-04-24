"""Albus (Super Admin) authentication and management routes."""

import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext

from backend.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from backend.models.albus import Albus
from backend.models.company import Company
from backend.models.student import Student
from backend.models.assessment import Assessment
from backend.models.session import ExamSession

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/albus", tags=["Albus"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginBody(BaseModel):
    email: str
    password: str


def _create_token(sub: str, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": sub, "role": role, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _verify_albus_token(token: str) -> str:
    """Decode JWT and ensure role is albus. Returns email."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "albus":
            raise HTTPException(403, "Albus access required")
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


security = HTTPBearer()

async def get_albus_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency: extract albus email from Authorization header."""
    return _verify_albus_token(credentials.credentials)


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/login")
async def login(body: LoginBody):
    albus = await Albus.find_one(Albus.email == body.email)
    if not albus or not pwd.verify(body.password, albus.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    token = _create_token(albus.email, "albus")
    return {"token": token, "role": "albus", "email": albus.email}


@router.get("/companies")
async def list_companies(email: str = Depends(get_albus_user)):
    companies = await Company.find_all().to_list()
    return [
        {
            "id": str(c.id),
            "company_name": c.company_name,
            "email": c.email,
            "registered_at": c.registered_at.isoformat() if c.registered_at else None,
            "assessment_count": c.assessment_count,
            "active_students": c.active_students,
            "is_verified": c.is_verified,
        }
        for c in companies
    ]


@router.post("/companies/{company_id}/verify")
async def toggle_verify(company_id: str, email: str = Depends(get_albus_user)):
    from bson import ObjectId
    company = await Company.get(ObjectId(company_id))
    if not company:
        raise HTTPException(404, "Company not found")
    company.is_verified = not company.is_verified
    await company.save()
    return {"id": str(company.id), "is_verified": company.is_verified}


@router.get("/stats")
async def get_stats(email: str = Depends(get_albus_user)):
    total_companies = await Company.count()
    total_assessments = await Assessment.count()
    total_students = await Student.count()
    active_sessions = await ExamSession.find(ExamSession.status == "active").count()
    return {
        "total_companies": total_companies,
        "total_assessments": total_assessments,
        "total_students": total_students,
        "active_sessions": active_sessions,
    }
