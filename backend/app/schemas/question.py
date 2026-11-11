from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class QuestionBase(BaseModel):
    category: str
    subtopic: Optional[str] = None
    title: str
    difficulty: str
    problem_statement: str
    key_concepts: List[str] = []
    hints: List[str] = []
    company_tags: List[str] = []

class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime
    recommendation_score: Optional[float] = None
    recommendation_reason: Optional[str] = None

    class Config:
        from_attributes = True

class QuestionDetailResponse(QuestionResponse):
    model_answer: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    question_id: int
    user_answer: str
    time_spent_seconds: Optional[int] = 0

class AnswerEvaluationResponse(BaseModel):
    attempt_id: int
    question_id: int
    score: float
    semantic_similarity: float
    keyword_coverage: float
    feedback: str
    strengths: List[str]
    missing_concepts: List[str]
    dimension_scores: Dict[str, float]
    model_answer: str

class AttemptHistoryItem(BaseModel):
    id: int
    question_id: int
    question_title: str
    category: str
    difficulty: str
    score: float
    semantic_similarity: float
    feedback: Optional[str]
    created_at: datetime

class CategoryPerformance(BaseModel):
    category: str
    total_attempted: int
    average_score: float
    status: str  # Strong, Needs Practice, Critical Weakness

class UserPerformanceSummary(BaseModel):
    total_questions_solved: int
    overall_average_score: float
    category_breakdown: List[CategoryPerformance]
    weak_topics: List[str]
    strong_topics: List[str]
    recent_attempts: List[AttemptHistoryItem]

