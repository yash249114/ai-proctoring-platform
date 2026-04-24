"""Company authentication routes — register and login."""

import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext

from backend.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from backend.models.company import Company

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/company", tags=["Company Auth"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterBody(BaseModel):
    company_name: str
    email: str
    password: str
    terms_accepted: bool = False


class LoginBody(BaseModel):
    email: str
    password: str



def _create_token(sub: str, role: str, company_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": sub, "role": role, "company_id": company_id, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register")
async def register(body: RegisterBody):
    if not body.terms_accepted:
        raise HTTPException(400, "You must accept the Terms & Conditions to register")

    existing = await Company.find_one(Company.email == body.email)
    if existing:
        raise HTTPException(400, "A company with this email already exists")


    company = Company(
        company_name=body.company_name,
        email=body.email,
        hashed_password=pwd.hash(body.password),
        terms_accepted=True,
        is_verified=True,
        is_email_verified=True,
        registered_at=datetime.now(timezone.utc),
    )
    await company.insert()
    
    logger.info("Company registered: %s (%s)", body.company_name, body.email)
    return {"message": "Registration successful. Please login to continue.", "company_id": str(company.id)}



@router.post("/login")
async def login(body: LoginBody):
    company = await Company.find_one(Company.email == body.email)
    if not company or not pwd.verify(body.password, company.hashed_password):
        raise HTTPException(401, "Invalid credentials")


    token = _create_token(company.email, "company", str(company.id))
    return {
        "token": token,
        "role": "company",
        "company_id": str(company.id),
        "company_name": company.company_name,
        "email": company.email,
    }
