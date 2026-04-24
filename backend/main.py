"""AI Proctored Assessment Platform — FastAPI entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from passlib.context import CryptContext
import os

from backend.config import MONGO_URI, DATABASE_NAME
from backend.models.albus import Albus
from backend.models.company import Company
from backend.models.student import Student
from backend.models.question import Question
from backend.models.assessment import Assessment
from backend.models.session import ExamSession
from backend.models.submission import Submission
from backend.models.contact import Contact
from backend.models.report import Report
from pydantic import BaseModel

from backend.routers import (
    albus_auth, company_auth, company_dashboard,
    assessments, questions, students,
    exam_session, ws, scraper,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "webcam"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Connecting to MongoDB at %s …", MONGO_URI)
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[Albus, Company, Student, Question, Assessment, ExamSession, Submission, Contact, Report],
    )
    logger.info("Beanie initialised with 9 models.")

    # Delete existing Albus super-admin accounts and seed the specified one
    await Albus.delete_all()
    admin = Albus(
        email="yaswanthrajmouli@albus.ai",
        hashed_password=pwd.hash("Yash@albus20"),
    )
    await admin.insert()
    logger.info("Seeded Albus admin: yaswanthrajmouli@albus.ai")

    yield
    client.close()
    logger.info("MongoDB connection closed.")


app = FastAPI(
    title="Albus — AI Proctored Assessment Platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers
app.include_router(albus_auth.router)
app.include_router(company_auth.router)
app.include_router(company_dashboard.router)
app.include_router(assessments.router)
app.include_router(questions.router)
app.include_router(students.router)
app.include_router(exam_session.router)
app.include_router(ws.router)
app.include_router(scraper.router)


@app.get("/")
async def root():
    return {"message": "Albus — AI Proctored Assessment Platform", "status": "running", "version": "2.0.0"}

class ContactRequest(BaseModel):
    name: str
    email: str
    company: str
    message: str

@app.post("/contact")
async def create_contact(req: ContactRequest):
    contact = Contact(name=req.name, email=req.email, company=req.company, message=req.message)
    await contact.insert()
    return {"status": "success", "message": "Contact saved"}

class ReportRequest(BaseModel):
    email: str
    issue_type: str
    description: str

@app.post("/report")
async def create_report(req: ReportRequest):
    report = Report(email=req.email, issue_type=req.issue_type, description=req.description)
    await report.insert()
    return {"status": "success", "message": "Report saved"}
