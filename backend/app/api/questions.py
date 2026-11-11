import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.interview_question import InterviewQuestion
from app.models.interview_attempt import InterviewAttempt
from app.models.resume import Resume
from app.schemas.question import QuestionResponse, QuestionDetailResponse
from app.services.question_recommender import question_recommender

router = APIRouter(prefix="/questions", tags=["Technical Question Bank"])

@router.get("/", response_model=List[QuestionResponse])
def get_questions(
    category: Optional[str] = Query(None, description="Filter by category (DSA, DBMS, OOPs, SQL, Python, Java, System Design, HR)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (Easy, Medium, Hard)"),
    q: Optional[str] = Query(None, description="Search keyword in title or problem statement"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieves technical interview questions with optional filtering."""
    query = db.query(InterviewQuestion)
    if category:
        query = query.filter(InterviewQuestion.category.ilike(f"%{category}%"))
    if difficulty:
        query = query.filter(InterviewQuestion.difficulty.ilike(f"%{difficulty}%"))
    if q:
        query = query.filter(
            or_(
                InterviewQuestion.title.ilike(f"%{q}%"),
                InterviewQuestion.problem_statement.ilike(f"%{q}%"),
                InterviewQuestion.subtopic.ilike(f"%{q}%")
            )
        )

    questions = query.order_by(InterviewQuestion.id.asc()).limit(limit).all()
    return [_format_question(item) for item in questions]

@router.get("/recommendations/me", response_model=List[QuestionResponse])
def get_personalized_recommendations(
    target_role: Optional[str] = Query("Full-Stack Engineer"),
    limit: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ML Personalized Question Recommender:
    Synthesizes candidate resume skills and weak-topic performance to rank
    the most impactful questions to practice next.
    """
    # 1. Fetch user's latest resume skills
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_skills = json.loads(latest_resume.skills_json) if latest_resume and latest_resume.skills_json else []

    # 2. Fetch user's previous attempts
    attempts = db.query(InterviewAttempt).filter(InterviewAttempt.user_id == current_user.id).all()
    user_attempts_data = []
    for att in attempts:
        q_item = db.query(InterviewQuestion).filter(InterviewQuestion.id == att.question_id).first()
        user_attempts_data.append({
            "question_id": att.question_id,
            "category": q_item.category if q_item else "General",
            "score": att.score
        })

    # 3. Fetch all available questions
    all_q_entities = db.query(InterviewQuestion).all()
    all_q_dicts = [_format_question(q) for q in all_q_entities]

    # 4. Run Machine Learning Recommender
    recommendations = question_recommender.recommend_questions(
        all_questions=all_q_dicts,
        user_attempts=user_attempts_data,
        resume_skills=resume_skills,
        target_role=target_role,
        limit=limit
    )

    return recommendations

@router.get("/{question_id}", response_model=QuestionDetailResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    """Retrieves single question with hints and key concepts."""
    q_item = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    if not q_item:
        raise HTTPException(status_code=404, detail="Question not found")
    formatted = _format_question(q_item)
    formatted["model_answer"] = q_item.model_answer
    return formatted

def _format_question(q: InterviewQuestion) -> dict:
    return {
        "id": q.id,
        "category": q.category,
        "subtopic": q.subtopic,
        "title": q.title,
        "difficulty": q.difficulty,
        "problem_statement": q.problem_statement,
        "key_concepts": json.loads(q.key_concepts_json) if q.key_concepts_json else [],
        "hints": json.loads(q.hints_json) if q.hints_json else [],
        "company_tags": json.loads(q.company_tags_json) if q.company_tags_json else [],
        "created_at": q.created_at,
        "recommendation_score": getattr(q, "recommendation_score", None),
        "recommendation_reason": getattr(q, "recommendation_reason", None)
    }

