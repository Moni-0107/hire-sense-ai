from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), index=True, nullable=False)  # DSA, DBMS, OOPs, SQL, Python, Java, System Design, Frontend, Backend, HR
    subtopic = Column(String(100), index=True, nullable=True)    # e.g., Indexing, Normalization, Dynamic Programming, Promises
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Medium")          # Easy, Medium, Hard
    problem_statement = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    key_concepts_json = Column(Text, default="[]")              # Mandatory technical keywords expected in answer
    hints_json = Column(Text, default="[]")
    company_tags_json = Column(Text, default="[]")              # e.g., ["Google", "Amazon", "Microsoft"]
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    attempts = relationship("InterviewAttempt", back_populates="question", cascade="all, delete-orphan")

