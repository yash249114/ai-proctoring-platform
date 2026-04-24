"""AI Evaluation Engine — grades coding + MCQ answers via OpenRouter."""

import json
import logging
from datetime import datetime, timezone

from openai import AsyncOpenAI

from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL
from models.session import ExamSession
from models.question import Question
from models.submission import Submission
from services.ws_manager import manager

logger = logging.getLogger(__name__)

client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_BASE_URL,
)


async def evaluate_coding(question: Question, answer: str) -> dict:
    """Use LLM to evaluate a coding answer. Returns score + feedback."""
    if not OPENROUTER_API_KEY:
        return {"score": 0, "verdict": "API key not configured", "hints": "", "time_complexity": "N/A", "space_complexity": "N/A"}

    prompt = f"""You are a coding evaluator. Evaluate the following code submission.

Problem: {question.title}
Description: {question.description}
Constraints: {question.constraints or 'None'}
Sample Input: {question.sample_input or 'None'}
Sample Output: {question.sample_output or 'None'}

Student's Code:
```
{answer}
```

Return a JSON object with these fields:
- "score": integer 0-100
- "verdict": "correct" / "partially_correct" / "wrong" / "compilation_error"
- "time_complexity": estimated time complexity (e.g. "O(n)")
- "space_complexity": estimated space complexity (e.g. "O(1)")
- "hints": brief constructive feedback (1-2 sentences)

Return ONLY the JSON object, nothing else."""

    try:
        response = await client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        text = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except Exception as e:
        logger.error("Coding eval error: %s", e)
        return {"score": 0, "verdict": "evaluation_error", "hints": str(e), "time_complexity": "N/A", "space_complexity": "N/A"}


def evaluate_mcq(question: Question, answer: str) -> dict:
    """Compare MCQ answer to correct answer. Returns 0 or 100."""
    if not question.correct_answer:
        return {"score": 0, "verdict": "no_correct_answer_set"}
    is_correct = answer.strip().lower() == question.correct_answer.strip().lower()
    return {
        "score": 100 if is_correct else 0,
        "verdict": "correct" if is_correct else "wrong",
    }


async def evaluate_submission(session_id: str, answers: dict, questions: list[Question]):
    """Evaluate all answers for a session and create a Submission record."""
    per_question_scores = {}
    total = 0

    for q in questions:
        qid = str(q.id)
        answer = answers.get(qid, "")
        if q.type == "coding":
            result = await evaluate_coding(q, answer)
        else:
            result = evaluate_mcq(q, answer)
        per_question_scores[qid] = result
        total += result.get("score", 0)

    avg_score = total / len(questions) if questions else 0

    # Load session for proctoring data
    session = await ExamSession.find_one(ExamSession.session_id == session_id)
    if not session:
        logger.error("Session %s not found for submission", session_id)
        return

    # Count proctoring violations by type
    tab_switches = sum(1 for e in session.proctor_log if e.get("event") == "tab_switch")
    phone_detected = sum(1 for e in session.proctor_log if e.get("event") == "phone_detected")
    away_count = sum(1 for e in session.proctor_log if e.get("event") == "face_away")

    time_taken = 0
    if session.end_time and session.start_time:
        time_taken = int((session.end_time - session.start_time).total_seconds() / 60)

    submission = Submission(
        session_id=session_id,
        student_id=session.student_id,
        assessment_id=session.assessment_id,
        company_id=session.company_id,
        submitted_at=datetime.now(timezone.utc),
        total_score=round(avg_score, 2),
        per_question_scores=per_question_scores,
        time_taken_minutes=time_taken,
        proctoring_summary={
            "total_violations": session.violation_count,
            "tab_switches": tab_switches,
            "phone_detected": phone_detected,
            "away_count": away_count,
        },
    )
    await submission.insert()

    # Update session AI feedback
    session.ai_feedback = per_question_scores
    await session.save()

    # Notify via WebSocket
    await manager.send_json(session_id, {
        "type": "evaluation_complete",
        "total_score": round(avg_score, 2),
        "per_question_scores": {k: v.get("score", 0) for k, v in per_question_scores.items()},
    })

    logger.info("Evaluation complete for session %s — score %.2f", session_id, avg_score)
