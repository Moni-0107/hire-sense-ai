from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    
    job_title_target = Column(String(255), nullable=True)
    target_company = Column(String(255), nullable=True)
    
    compatibility_score = Column(Float, default=0.0)
    ats_score = Column(Float, default=0.0)
    
    # NLP and matching metrics
    semantic_similarity = Column(Float, default=0.0)
    skills_match_percentage = Column(Float, default=0.0)
    
    # JSON-encoded analysis results
    matched_skills_json = Column(Text, default="[]")
    missing_skills_json = Column(Text, default="[]")
    recommendations_json = Column(Text, default="[]")
    learning_roadmap_json = Column(Text, default="[]")
    score_breakdown_json = Column(Text, default="{}")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analysis_reports")
    resume = relationship("Resume", back_populates="analysis_reports")
    job = relationship("Job", back_populates="analysis_reports")

