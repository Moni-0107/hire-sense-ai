from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InterviewAttempt(Base):
    __tablename__ = "interview_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    user_answer = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    semantic_similarity = Column(Float, default=0.0)
    keyword_coverage = Column(Float, default=0.0)
    
    feedback = Column(Text, nullable=True)
    strengths_json = Column(Text, default="[]")
    missing_concepts_json = Column(Text, default="[]")
    time_spent_seconds = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="interview_attempts")
    question = relationship("InterviewQuestion", back_populates="attempts")

