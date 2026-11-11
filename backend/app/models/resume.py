from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    
    # Parsed information stored as JSON strings
    candidate_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    
    # JSON-encoded fields
    education_json = Column(Text, default="[]")
    experience_json = Column(Text, default="[]")
    skills_json = Column(Text, default="[]")
    projects_json = Column(Text, default="[]")
    certifications_json = Column(Text, default="[]")
    
    # ATS Score and metrics
    ats_score = Column(Float, default=0.0)
    score_breakdown_json = Column(Text, default="{}")
    improvement_suggestions_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analysis_reports = relationship("AnalysisReport", back_populates="resume", cascade="all, delete-orphan")

