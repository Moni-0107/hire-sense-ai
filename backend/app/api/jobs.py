import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.services.job_matcher import job_matcher

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    q: Optional[str] = Query(None, description="Search term for title, company, or description"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieves list of active jobs, with optional filtering."""
    query = db.query(Job)
    if q:
        query = query.filter(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.company.ilike(f"%{q}%"),
                Job.description.ilike(f"%{q}%")
            )
        )
    if experience_level:
        query = query.filter(Job.experience_level.ilike(f"%{experience_level}%"))

    jobs = query.order_by(Job.created_at.desc()).limit(limit).all()
    return [_format_job(j) for j in jobs]

@router.get("/recommendations/{resume_id}")
def get_personalized_recommendations(
    resume_id: int,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ranks all available platform jobs for the candidate's resume
    based on NLP semantic match and skill overlap, returning top personalized recommendations.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = json.loads(resume.skills_json) if resume.skills_json else []
    all_jobs = db.query(Job).all()

    ranked = []
    for job in all_jobs:
        req_skills = json.loads(job.required_skills_json) if job.required_skills_json else []
        pref_skills = json.loads(job.preferred_skills_json) if job.preferred_skills_json else []

        match_res = job_matcher.match(
            resume_text=resume.raw_text,
            resume_skills=resume_skills,
            job_description=job.description,
            required_skills=req_skills,
            preferred_skills=pref_skills,
            job_title=job.title
        )

        job_dict = _format_job(job)
        job_dict["compatibility_score"] = match_res["compatibility_score"]
        job_dict["matched_skills"] = match_res["matched_skills"]
        job_dict["missing_critical_skills"] = match_res["missing_critical_skills"]
        ranked.append(job_dict)

    # Sort descending by compatibility score
    ranked.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return ranked[:limit]

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retrieves a single job posting by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _format_job(job)

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin endpoint to create a new job opening."""
    job = Job(
        title=job_in.title,
        company=job_in.company,
        location=job_in.location or "Remote",
        employment_type=job_in.employment_type or "Full-time",
        experience_level=job_in.experience_level or "Mid-Level",
        salary_range=job_in.salary_range,
        description=job_in.description,
        required_skills_json=json.dumps(job_in.required_skills or []),
        preferred_skills_json=json.dumps(job_in.preferred_skills or [])
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return _format_job(job)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin endpoint to update job details."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = job_in.dict(exclude_unset=True)
    if "required_skills" in update_data:
        job.required_skills_json = json.dumps(update_data.pop("required_skills"))
    if "preferred_skills" in update_data:
        job.preferred_skills_json = json.dumps(update_data.pop("preferred_skills"))

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return _format_job(job)

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin endpoint to remove a job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return None

def _format_job(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "employment_type": job.employment_type,
        "experience_level": job.experience_level,
        "salary_range": job.salary_range,
        "description": job.description,
        "required_skills": json.loads(job.required_skills_json) if job.required_skills_json else [],
        "preferred_skills": json.loads(job.preferred_skills_json) if job.preferred_skills_json else [],
        "created_at": job.created_at,
        "updated_at": job.updated_at
    }

