"""Assessment CRUD routes + send-to-students endpoint."""

import logging
import secrets
import string
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt
from passlib.context import CryptContext
from bson import ObjectId

from backend.config import JWT_SECRET, JWT_ALGORITHM, FRONTEND_URL
from backend.models.assessment import Assessment
from backend.models.question import Question
from backend.models.student import Student
from backend.models.company import Company
from backend.services.email_service import send_exam_credentials

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assessments", tags=["Assessments"])
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _get_company_id(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "company":
            raise HTTPException(403, "Company access required")
        return payload["company_id"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


class CreateBody(BaseModel):
    title: str
    description: str = ""
    question_ids: List[str] = []
    duration_minutes: int = 60
    scheduled_at: Optional[str] = None


class UpdateBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    question_ids: Optional[List[str]] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    scheduled_at: Optional[str] = None


class StudentEntry(BaseModel):
    name: str
    college_id: str
    email: str


class SendBody(BaseModel):
    students: List[StudentEntry]


def _gen_password(length: int = 8) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


@router.post("/create")
async def create_assessment(body: CreateBody, authorization: str = Header("")):
    cid = _get_company_id(authorization)

    # Determine question types from the selected questions
    question_types = []
    if body.question_ids:
        for qid in body.question_ids:
            try:
                q = await Question.get(ObjectId(qid))
                if q and q.type not in question_types:
                    question_types.append(q.type)
            except Exception:
                pass

    scheduled = None
    if body.scheduled_at:
        try:
            scheduled = datetime.fromisoformat(body.scheduled_at)
        except Exception:
            pass

    assessment = Assessment(
        company_id=cid,
        title=body.title,
        description=body.description,
        question_ids=body.question_ids,
        duration_minutes=body.duration_minutes,
        status="draft",
        created_at=datetime.now(timezone.utc),
        scheduled_at=scheduled,
        question_types=question_types,
    )
    await assessment.insert()

    # Update company assessment count
    company = await Company.get(ObjectId(cid))
    if company:
        company.assessment_count += 1
        await company.save()

    return {"assessment_id": str(assessment.id), "message": "Assessment created"}


@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, authorization: str = Header("")):
    cid = _get_company_id(authorization)
    assessment = await Assessment.get(ObjectId(assessment_id))
    if not assessment or assessment.company_id != cid:
        raise HTTPException(404, "Assessment not found")

    # Populate questions
    questions = []
    for qid in assessment.question_ids:
        try:
            q = await Question.get(ObjectId(qid))
            if q:
                questions.append({
                    "id": str(q.id),
                    "type": q.type,
                    "title": q.title,
                    "description": q.description,
                    "constraints": q.constraints,
                    "sample_input": q.sample_input,
                    "sample_output": q.sample_output,
                    "explanation": q.explanation,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "image_url": q.image_url,
                    "difficulty": q.difficulty,
                    "tags": q.tags,
                })
        except Exception:
            pass

    return {
        "id": str(assessment.id),
        "title": assessment.title,
        "description": assessment.description,
        "duration_minutes": assessment.duration_minutes,
        "status": assessment.status,
        "question_types": assessment.question_types,
        "questions": questions,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
        "scheduled_at": assessment.scheduled_at.isoformat() if assessment.scheduled_at else None,
    }


@router.put("/{assessment_id}")
async def update_assessment(assessment_id: str, body: UpdateBody, authorization: str = Header("")):
    cid = _get_company_id(authorization)
    assessment = await Assessment.get(ObjectId(assessment_id))
    if not assessment or assessment.company_id != cid:
        raise HTTPException(404, "Assessment not found")

    if body.title is not None:
        assessment.title = body.title
    if body.description is not None:
        assessment.description = body.description
    if body.question_ids is not None:
        assessment.question_ids = body.question_ids
    if body.duration_minutes is not None:
        assessment.duration_minutes = body.duration_minutes
    if body.status is not None:
        assessment.status = body.status
    if body.scheduled_at is not None:
        try:
            assessment.scheduled_at = datetime.fromisoformat(body.scheduled_at)
        except Exception:
            pass

    await assessment.save()
    return {"message": "Assessment updated"}


@router.post("/{assessment_id}/send")
async def send_assessment(assessment_id: str, body: SendBody, background_tasks: BackgroundTasks, authorization: str = Header("")):
    cid = _get_company_id(authorization)
    assessment = await Assessment.get(ObjectId(assessment_id))
    if not assessment or assessment.company_id != cid:
        raise HTTPException(404, "Assessment not found")

    # Mark assessment as active
    assessment.status = "active"
    await assessment.save()

    sent_count = 0
    failed_emails = []
    created_students = []

    for entry in body.students:
        raw_password = _gen_password()

        # Check if student already exists with same college_id for this company
        existing = await Student.find_one(
            Student.college_id == entry.college_id,
            Student.company_id == cid,
        )
        if existing:
            student = existing
            if assessment_id not in student.assigned_assessments:
                student.assigned_assessments.append(assessment_id)
                await student.save()
        else:
            student = Student(
                name=entry.name,
                email=entry.email,
                college_id=entry.college_id,
                hashed_password=pwd.hash(raw_password),
                company_id=cid,
                assigned_assessments=[assessment_id],
            )
            await student.insert()

        # Update company active_students
        company = await Company.get(ObjectId(cid))
        if company:
            company.active_students = await Student.find(Student.company_id == cid).count()
            await company.save()

        exam_link = f"{FRONTEND_URL}/student/login"
        scheduled_str = assessment.scheduled_at.strftime("%B %d, %Y at %I:%M %p") if assessment.scheduled_at else "As soon as available"

        success = await send_exam_credentials(
            student_email=entry.email,
            student_name=entry.name,
            username=entry.college_id,
            password=raw_password,
            exam_link=exam_link,
            assessment_title=assessment.title,
            duration_minutes=assessment.duration_minutes,
            scheduled_at=scheduled_str,
        )

        if success:
            sent_count += 1
            created_students.append({
                "name": entry.name,
                "college_id": entry.college_id,
                "email": entry.email,
                "password": raw_password,  # returned so company can see if email fails
            })
        else:
            failed_emails.append(entry.email)

    return {
        "sent_count": sent_count,
        "failed_emails": failed_emails,
        "students": created_students,
        "message": f"Assessment sent to {sent_count} students",
    }
