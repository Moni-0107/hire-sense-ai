from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class EducationItem(BaseModel):
    institution: str
    degree: str
    year: Optional[str] = None
    gpa: Optional[str] = None

class ExperienceItem(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    bullets: List[str] = []

class ProjectItem(BaseModel):
    name: str
    tech_stack: List[str] = []
    description: str

class SuggestionItem(BaseModel):
    category: str
    severity: str  # high, medium, low
    title: str
    message: str
    recommendation: str

class AtsScoreBreakdown(BaseModel):
    total_score: float
    formatting_score: float
    sections_score: float
    keywords_score: float
    action_verbs_score: float
    quantified_impact_score: float
    metrics: Dict[str, Any]

class ParsedResumeData(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    skills: List[str] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    ats_score: float = 0.0
    score_breakdown: Optional[AtsScoreBreakdown] = None
    suggestions: List[SuggestionItem] = []

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_type: str
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    skills: List[str] = []
    ats_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeDetailResponse(ResumeResponse):
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    score_breakdown: Optional[AtsScoreBreakdown] = None
    suggestions: List[SuggestionItem] = []
    raw_text_preview: Optional[str] = None

