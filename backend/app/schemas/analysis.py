from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class LearningItem(BaseModel):
    skill: str
    category: str
    importance: str  # high, medium, low
    overview: str
    recommended_topics: List[str]
    courses_or_docs: List[Dict[str, str]]
    hands_on_project: str

class MatchRequest(BaseModel):
    resume_id: int
    job_id: Optional[int] = None
    job_description: Optional[str] = None
    job_title: Optional[str] = None
    target_company: Optional[str] = None

class MatchResponse(BaseModel):
    compatibility_score: float
    ats_score: float
    semantic_similarity: float
    skills_match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    missing_critical_skills: List[str]
    recommendations: List[str]
    learning_roadmap: List[LearningItem]
    score_breakdown: Dict[str, Any]
    target_job_title: Optional[str] = None
    target_company: Optional[str] = None

class AnalysisReportResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_id: Optional[int] = None
    job_title_target: Optional[str] = None
    target_company: Optional[str] = None
    compatibility_score: float
    ats_score: float
    semantic_similarity: float
    skills_match_percentage: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    recommendations: List[str] = []
    learning_roadmap: List[LearningItem] = []
    score_breakdown: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

