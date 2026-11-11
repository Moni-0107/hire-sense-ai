from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), default="Remote")
    employment_type = Column(String(100), default="Full-time")  # Full-time, Part-time, Contract, Internship
    experience_level = Column(String(100), default="Mid-Level") # Entry-Level, Mid-Level, Senior
    salary_range = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    
    # JSON-encoded skills
    required_skills_json = Column(Text, default="[]")
    preferred_skills_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analysis_reports = relationship("AnalysisReport", back_populates="job", cascade="all, delete-orphan")

