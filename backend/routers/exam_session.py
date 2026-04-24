"""Exam session routes — start, submit, disqualify."""

import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Dict
from jose import jwt
from bson import ObjectId

from config import JWT_SECRET, JWT_ALGORITHM
from models.session import ExamSession
from models.assessment import Assessment
from models.question import Question
from services.eval_engine import evaluate_submission

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/exam", tags=["Exam Session"])


def _get_student_info(authorization: str) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "student":
            raise HTTPException(403, "Student access required")
        return {"student_id": payload["student_id"], "company_id": payload["company_id"]}
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


class StartBody(BaseModel):
    assessment_id: str


class SubmitBody(BaseModel):
    session_id: str
    answers: Dict[str, str] = {}


class DisqualifyBody(BaseModel):
    session_id: str
    reason: str = ""


@router.post("/start")
async def start_exam(body: StartBody, authorization: str = Header("")):
    info = _get_student_info(authorization)
    assessment = await Assessment.get(ObjectId(body.assessment_id))
    if not assessment:
        raise HTTPException(404, "Assessment not found")

    # Check if student already has active session for this assessment
    existing = await ExamSession.find_one(
        ExamSession.student_id == info["student_id"],
        ExamSession.assessment_id == body.assessment_id,
        ExamSession.status == "active",
    )
    if existing:
        # Return existing session
        questions = []
        for qid in assessment.question_ids:
            try:
                q = await Question.get(ObjectId(qid))
                if q:
                    qd = {
                        "id": str(q.id), "type": q.type, "title": q.title,
                        "description": q.description, "constraints": q.constraints,
                        "sample_input": q.sample_input, "sample_output": q.sample_output,
                        "options": q.options, "image_url": q.image_url,
                        "difficulty": q.difficulty, "explanation": q.explanation,
                    }
                    questions.append(qd)
            except Exception:
                pass
        return {
            "session_id": existing.session_id,
            "assessment_title": assessment.title,
            "duration_minutes": assessment.duration_minutes,
            "questions": questions,
            "answers": existing.answers,
        }

    sid = str(uuid.uuid4())
    session = ExamSession(
        session_id=sid,
        student_id=info["student_id"],
        assessment_id=body.assessment_id,
        company_id=info["company_id"],
        start_time=datetime.now(timezone.utc),
    )
    await session.insert()

    # Load questions WITHOUT correct_answers
    questions = []
    for qid in assessment.question_ids:
        try:
            q = await Question.get(ObjectId(qid))
            if q:
                qd = {
                    "id": str(q.id), "type": q.type, "title": q.title,
                    "description": q.description, "constraints": q.constraints,
                    "sample_input": q.sample_input, "sample_output": q.sample_output,
                    "options": q.options, "image_url": q.image_url,
                    "difficulty": q.difficulty, "explanation": q.explanation,
                }
                questions.append(qd)
        except Exception:
            pass

    return {
        "session_id": sid,
        "assessment_title": assessment.title,
        "duration_minutes": assessment.duration_minutes,
        "questions": questions,
        "answers": {},
    }


@router.post("/submit")
async def submit_exam(body: SubmitBody, background_tasks: BackgroundTasks, authorization: str = Header("")):
    _get_student_info(authorization)
    session = await ExamSession.find_one(ExamSession.session_id == body.session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status != "active":
        raise HTTPException(400, "Session already submitted or disqualified")

    session.answers = body.answers
    session.status = "submitted"
    session.end_time = datetime.now(timezone.utc)
    await session.save()

    # Load questions for evaluation
    assessment = await Assessment.get(ObjectId(session.assessment_id))
    questions = []
    if assessment:
        for qid in assessment.question_ids:
            try:
                q = await Question.get(ObjectId(qid))
                if q:
                    questions.append(q)
            except Exception:
                pass

    background_tasks.add_task(evaluate_submission, body.session_id, body.answers, questions)
    return {"message": "Exam submitted. Evaluation in progress.", "session_id": body.session_id}


@router.post("/disqualify")
async def disqualify(body: DisqualifyBody, authorization: str = Header("")):
    session = await ExamSession.find_one(ExamSession.session_id == body.session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    session.disqualified = True
    session.disqualify_reason = body.reason
    session.status = "disqualified"
    session.end_time = datetime.now(timezone.utc)
    await session.save()
    return {"message": "Student disqualified", "reason": body.reason}
