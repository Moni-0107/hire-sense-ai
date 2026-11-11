import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.interview_question import InterviewQuestion
from app.models.interview_attempt import InterviewAttempt
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    Base.metadata.create_all(bind=engine)
    
    # Seed default data
    db = SessionLocal()
    try:
        # Seed default Admin and Candidate accounts if not exist
        admin = db.query(User).filter(User.email.in_(["admin@devprep.ai", "admin@hiresense.ai"])).first()
        if not admin:
            admin_user = User(
                email="admin@devprep.ai",
                hashed_password=hash_password("Admin@123"),
                full_name="DevPrep Admin",
                role=UserRole.ADMIN.value
            )
            db.add(admin_user)

        candidate = db.query(User).filter(User.email.in_(["candidate@devprep.ai", "candidate@hiresense.ai"])).first()
        if not candidate:
            candidate_user = User(
                email="candidate@devprep.ai",
                hashed_password=hash_password("Demo@123"),
                full_name="Alex Johnson",
                role=UserRole.CANDIDATE.value
            )
            db.add(candidate_user)
            db.commit()
            db.refresh(candidate_user)
            candidate_id = candidate_user.id
        else:
            candidate_id = candidate.id

        # Seed sample job postings if empty
        jobs_count = db.query(Job).count()
        if jobs_count == 0:
            seed_file = os.path.join(os.path.dirname(__file__), "data", "seed_jobs.json")
            if os.path.exists(seed_file):
                with open(seed_file, "r", encoding="utf-8") as f:
                    jobs_data = json.load(f)
                    for item in jobs_data:
                        job = Job(
                            title=item["title"],
                            company=item["company"],
                            location=item.get("location", "Remote"),
                            employment_type=item.get("employment_type", "Full-time"),
                            experience_level=item.get("experience_level", "Mid-Level"),
                            salary_range=item.get("salary_range"),
                            description=item["description"],
                            required_skills_json=json.dumps(item.get("required_skills", [])),
                            preferred_skills_json=json.dumps(item.get("preferred_skills", []))
                        )
                        db.add(job)

        # Seed technical interview questions if empty
        questions_count = db.query(InterviewQuestion).count()
        if questions_count == 0:
            questions_file = os.path.join(os.path.dirname(__file__), "data", "seed_questions.json")
            if os.path.exists(questions_file):
                with open(questions_file, "r", encoding="utf-8") as f:
                    q_data = json.load(f)
                    for q in q_data:
                        question = InterviewQuestion(
                            category=q["category"],
                            subtopic=q.get("subtopic"),
                            title=q["title"],
                            difficulty=q.get("difficulty", "Medium"),
                            problem_statement=q["problem_statement"],
                            model_answer=q["model_answer"],
                            key_concepts_json=json.dumps(q.get("key_concepts", [])),
                            hints_json=json.dumps(q.get("hints", [])),
                            company_tags_json=json.dumps(q.get("company_tags", []))
                        )
                        db.add(question)
            db.commit()

            # Seed a sample attempt for candidate so performance charts display immediately
            first_q = db.query(InterviewQuestion).first()
            if first_q:
                attempt = InterviewAttempt(
                    user_id=candidate_id,
                    question_id=first_q.id,
                    user_answer="B+ trees store data pointers exclusively in leaf nodes which are connected sequentially. This makes range scans faster and speeds up selects via indexed lookups, but increases write overhead on inserts.",
                    score=86.5,
                    semantic_similarity=84.2,
                    keyword_coverage=87.5,
                    feedback="Strong response! Clearly identified leaf node structures and write overhead trade-offs.",
                    strengths_json=json.dumps(["Accurate structural distinction", "Identified sequential range scans"]),
                    missing_concepts_json=json.dumps(["disk i/o", "log n"]),
                    time_spent_seconds=120
                )
                db.add(attempt)

        db.commit()
    except Exception as e:
        print(f"Error during database startup seeding: {e}")
        db.rollback()
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DevPrep AI – Software Engineer Interview Preparation Platform API",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
