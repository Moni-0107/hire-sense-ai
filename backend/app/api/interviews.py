import json
from collections import defaultdict
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview_question import InterviewQuestion
from app.models.interview_attempt import InterviewAttempt
from app.schemas.question import (
    SubmitAnswerRequest,
    AnswerEvaluationResponse,
    AttemptHistoryItem,
    UserPerformanceSummary,
    CategoryPerformance
)
from app.services.answer_evaluator import answer_evaluator

router = APIRouter(prefix="/interviews", tags=["Mock Interview & AI Evaluation"])

@router.post("/evaluate", response_model=AnswerEvaluationResponse)
def evaluate_interview_answer(
    req: SubmitAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a candidate's answer for real-time AI evaluation.
    Measures semantic similarity, concept coverage, technical depth, and structure.
    Saves the attempt and returns actionable rubric feedback.
    """
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == req.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Interview question not found")

    key_concepts = json.loads(question.key_concepts_json) if question.key_concepts_json else []

    # Run AI evaluation engine
    eval_result = answer_evaluator.evaluate_answer(
        question_category=question.category,
        problem_statement=question.problem_statement,
        model_answer=question.model_answer,
        user_answer=req.user_answer,
        key_concepts=key_concepts
    )

    # Persist attempt to database
    attempt = InterviewAttempt(
        user_id=current_user.id,
        question_id=question.id,
        user_answer=req.user_answer,
        score=eval_result["score"],
        semantic_similarity=eval_result["semantic_similarity"],
        keyword_coverage=eval_result["keyword_coverage"],
        feedback=eval_result["feedback"],
        strengths_json=json.dumps(eval_result["strengths"]),
        missing_concepts_json=json.dumps(eval_result["missing_concepts"]),
        time_spent_seconds=req.time_spent_seconds or 0
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "question_id": question.id,
        "score": eval_result["score"],
        "semantic_similarity": eval_result["semantic_similarity"],
        "keyword_coverage": eval_result["keyword_coverage"],
        "feedback": eval_result["feedback"],
        "strengths": eval_result["strengths"],
        "missing_concepts": eval_result["missing_concepts"],
        "dimension_scores": eval_result["dimension_scores"],
        "model_answer": question.model_answer
    }

@router.get("/history", response_model=List[AttemptHistoryItem])
def get_attempt_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves user's practice session history ordered by most recent."""
    attempts = db.query(InterviewAttempt).filter(
        InterviewAttempt.user_id == current_user.id
    ).order_by(InterviewAttempt.created_at.desc()).limit(50).all()

    results = []
    for att in attempts:
        q = db.query(InterviewQuestion).filter(InterviewQuestion.id == att.question_id).first()
        results.append({
            "id": att.id,
            "question_id": att.question_id,
            "question_title": q.title if q else "Technical Question",
            "category": q.category if q else "General",
            "difficulty": q.difficulty if q else "Medium",
            "score": att.score,
            "semantic_similarity": att.semantic_similarity,
            "feedback": att.feedback,
            "created_at": att.created_at
        })
    return results

@router.get("/performance", response_model=UserPerformanceSummary)
def get_user_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Synthesizes user's overall interview performance, category breakdown,
    identifies weak areas (< 60%), and flags strong competencies (>= 80%).
    """
    attempts = db.query(InterviewAttempt).filter(
        InterviewAttempt.user_id == current_user.id
    ).order_by(InterviewAttempt.created_at.desc()).all()

    if not attempts:
        return {
            "total_questions_solved": 0,
            "overall_average_score": 0.0,
            "category_breakdown": [],
            "weak_topics": ["Start practicing questions to identify weak areas"],
            "strong_topics": [],
            "recent_attempts": []
        }

    category_scores = defaultdict(list)
    recent_history = []

    for i, att in enumerate(attempts):
        q = db.query(InterviewQuestion).filter(InterviewQuestion.id == att.question_id).first()
        cat = q.category if q else "General"
        category_scores[cat].append(att.score)

        if i < 8:
            recent_history.append({
                "id": att.id,
                "question_id": att.question_id,
                "question_title": q.title if q else "Technical Question",
                "category": cat,
                "difficulty": q.difficulty if q else "Medium",
                "score": att.score,
                "semantic_similarity": att.semantic_similarity,
                "feedback": att.feedback,
                "created_at": att.created_at
            })

    total_attempts = len(attempts)
    overall_avg = round(sum(a.score for a in attempts) / total_attempts, 1)

    breakdown = []
    weak_topics = []
    strong_topics = []

    for cat, scores in category_scores.items():
        avg = round(sum(scores) / len(scores), 1)
        if avg < 60.0:
            status = "Critical Weakness"
            weak_topics.append(cat)
        elif avg < 80.0:
            status = "Needs Practice"
        else:
            status = "Strong"
            strong_topics.append(cat)

        breakdown.append({
            "category": cat,
            "total_attempted": len(scores),
            "average_score": avg,
            "status": status
        })

    # Sort breakdown descending by attempts
    breakdown.sort(key=lambda x: x["total_attempted"], reverse=True)

    return {
        "total_questions_solved": total_attempts,
        "overall_average_score": overall_avg,
        "category_breakdown": breakdown,
        "weak_topics": weak_topics if weak_topics else ["None identified - maintain balanced practice!"],
        "strong_topics": strong_topics,
        "recent_attempts": recent_history
    }

