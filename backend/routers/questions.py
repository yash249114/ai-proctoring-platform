"""Question CRUD routes — supports multipart image upload."""

import os
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form
from typing import Optional
from jose import jwt
from bson import ObjectId

from backend.config import JWT_SECRET, JWT_ALGORITHM

from backend.models.question import Question

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/questions", tags=["Questions"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


@router.post("/create")
async def create_question(
    authorization: str = Header(""),
    type: str = Form("coding"),
    title: str = Form(""),
    description: str = Form(""),
    constraints: Optional[str] = Form(None),
    sample_input: Optional[str] = Form(None),
    sample_output: Optional[str] = Form(None),
    explanation: Optional[str] = Form(None),
    options: Optional[str] = Form(None),  # JSON string: '["A","B","C","D"]'
    correct_answer: Optional[str] = Form(None),
    difficulty: str = Form("medium"),
    tags: str = Form(""),  # comma-separated
    source_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    cid = _get_company_id(authorization)

    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        fname = f"{uuid.uuid4()}{ext}"
        fpath = os.path.join(UPLOAD_DIR, fname)
        content = await image.read()
        with open(fpath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{fname}"

    parsed_options = None
    if options:
        import json
        try:
            parsed_options = json.loads(options)
        except Exception:
            parsed_options = [o.strip() for o in options.split(",") if o.strip()]

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    question = Question(
        company_id=cid,
        type=type,
        title=title,
        description=description,
        constraints=constraints,
        sample_input=sample_input,
        sample_output=sample_output,
        explanation=explanation,
        options=parsed_options,
        correct_answer=correct_answer,
        image_url=image_url,
        difficulty=difficulty,
        tags=tag_list,
        source_url=source_url,
        created_at=datetime.now(timezone.utc),
    )
    await question.insert()
    return {"question_id": str(question.id), "message": "Question created"}


@router.get("/{company_id}")
async def list_questions(company_id: str, authorization: str = Header("")):
    _get_company_id(authorization)  # verify auth
    questions = await Question.find(Question.company_id == company_id).to_list()
    return [
        {
            "id": str(q.id),
            "type": q.type,
            "title": q.title,
            "description": q.description[:200] if q.description else "",
            "difficulty": q.difficulty,
            "tags": q.tags,
            "image_url": q.image_url,
            "options": q.options,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in questions
    ]


@router.delete("/{question_id}")
async def delete_question(question_id: str, authorization: str = Header("")):
    cid = _get_company_id(authorization)
    question = await Question.get(ObjectId(question_id))
    if not question or question.company_id != cid:
        raise HTTPException(404, "Question not found")
    await question.delete()
    return {"message": "Question deleted"}
