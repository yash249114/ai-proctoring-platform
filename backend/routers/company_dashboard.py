"""Company dashboard routes — assessments overview, students, results."""

import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from bson import ObjectId

from backend.config import JWT_SECRET, JWT_ALGORITHM
from backend.models.company import Company
from backend.models.assessment import Assessment
from backend.models.student import Student
from backend.models.submission import Submission
from backend.models.session import ExamSession

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/company", tags=["Company Dashboard"])


security = HTTPBearer()

def _get_company_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract company_id from JWT."""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "company":
            raise HTTPException(403, "Company access required")
        return payload["company_id"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")


@router.get("/dashboard")
async def dashboard(cid: str = Depends(_get_company_id)):
    assessments = await Assessment.find(Assessment.company_id == cid).to_list()
    student_count = await Student.find(Student.company_id == cid).count()
    active_sessions = await ExamSession.find(
        ExamSession.company_id == cid, ExamSession.status == "active"
    ).count()

    return {
        "assessments": [
            {
                "id": str(a.id),
                "title": a.title,
                "description": a.description,
                "status": a.status,
                "duration_minutes": a.duration_minutes,
                "question_count": len(a.question_ids),
                "question_types": a.question_types,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
            }
            for a in assessments
        ],
        "student_count": student_count,
        "active_sessions": active_sessions,
    }


@router.get("/students")
async def list_students(cid: str = Depends(_get_company_id)):
    students = await Student.find(Student.company_id == cid).to_list()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "email": s.email,
            "college_id": s.college_id,
            "assigned_assessments": s.assigned_assessments,
        }
        for s in students
    ]


@router.get("/results/{assessment_id}")
async def get_results(assessment_id: str, cid: str = Depends(_get_company_id)):
    assessment = await Assessment.get(ObjectId(assessment_id))
    if not assessment or assessment.company_id != cid:
        raise HTTPException(404, "Assessment not found")

    submissions = await Submission.find(Submission.assessment_id == assessment_id).to_list()
    results = []
    for sub in submissions:
        # Lookup student name / college_id
        student = await Student.find_one(Student.id == ObjectId(sub.student_id)) if sub.student_id else None
        session = await ExamSession.find_one(ExamSession.session_id == sub.session_id) if sub.session_id else None
        results.append({
            "submission_id": str(sub.id),
            "student_name": student.name if student else "Unknown",
            "college_id": student.college_id if student else "",
            "score": sub.total_score,
            "time_taken_minutes": sub.time_taken_minutes,
            "violation_count": sub.proctoring_summary.get("total_violations", 0),
            "tab_switches": sub.proctoring_summary.get("tab_switches", 0),
            "disqualified": session.disqualified if session else False,
            "status": session.status if session else "unknown",
            "per_question_scores": sub.per_question_scores,
            "proctoring_summary": sub.proctoring_summary,
        })

    return {
        "assessment_title": assessment.title,
        "results": results,
    }
