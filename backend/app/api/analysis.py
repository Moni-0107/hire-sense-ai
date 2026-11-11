import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.analysis_report import AnalysisReport
from app.schemas.analysis import MatchRequest, MatchResponse, AnalysisReportResponse
from app.services.job_matcher import job_matcher

router = APIRouter(prefix="/analysis", tags=["Analysis & Matching"])

@router.post("/match", response_model=MatchResponse)
def match_resume_to_job(
    request: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Performs AI NLP job matching between an uploaded resume and either:
    1. An existing database job_id, OR
    2. A custom pasted job description.
    Saves and persists the report in the database.
    """
    resume = db.query(Resume).filter(Resume.id == request.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = json.loads(resume.skills_json) if resume.skills_json else []

    job_title = request.job_title
    target_company = request.target_company
    job_description = request.job_description
    required_skills = []
    preferred_skills = []

    if request.job_id:
        job = db.query(Job).filter(Job.id == request.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job_title = job.title
        target_company = job.company
        job_description = job.description
        required_skills = json.loads(job.required_skills_json) if job.required_skills_json else []
        preferred_skills = json.loads(job.preferred_skills_json) if job.preferred_skills_json else []
    elif not job_description or len(job_description.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Either a valid 'job_id' or a 'job_description' text must be provided."
        )

    # Execute Job Matching Engine
    match_result = job_matcher.match(
        resume_text=resume.raw_text,
        resume_skills=resume_skills,
        job_description=job_description,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        job_title=job_title
    )

    # Save Analysis Report to DB
    report = AnalysisReport(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=request.job_id,
        job_title_target=job_title or "Target Position",
        target_company=target_company or "Target Company",
        compatibility_score=match_result["compatibility_score"],
        ats_score=resume.ats_score,
        semantic_similarity=match_result["semantic_similarity"],
        skills_match_percentage=match_result["skills_match_percentage"],
        matched_skills_json=json.dumps(match_result["matched_skills"]),
        missing_skills_json=json.dumps(match_result["missing_skills"]),
        recommendations_json=json.dumps(match_result["recommendations"]),
        learning_roadmap_json=json.dumps(match_result["learning_roadmap"]),
        score_breakdown_json=json.dumps(match_result["score_breakdown"])
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    response_dict = match_result.copy()
    response_dict["ats_score"] = resume.ats_score
    response_dict["target_job_title"] = job_title
    response_dict["target_company"] = target_company
    return response_dict

@router.get("/reports", response_model=List[AnalysisReportResponse])
def get_user_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists all previously saved resume analysis and job matching reports for the user."""
    reports = db.query(AnalysisReport).filter(AnalysisReport.user_id == current_user.id).order_by(AnalysisReport.created_at.desc()).all()
    return [_format_report(r) for r in reports]

@router.get("/reports/{report_id}", response_model=AnalysisReportResponse)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full analysis report by ID."""
    report = db.query(AnalysisReport).filter(
        AnalysisReport.id == report_id,
        AnalysisReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found")
    return _format_report(report)

@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a saved analysis report."""
    report = db.query(AnalysisReport).filter(
        AnalysisReport.id == report_id,
        AnalysisReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found")
    db.delete(report)
    db.commit()
    return None

def _format_report(r: AnalysisReport) -> dict:
    return {
        "id": r.id,
        "user_id": r.user_id,
        "resume_id": r.resume_id,
        "job_id": r.job_id,
        "job_title_target": r.job_title_target,
        "target_company": r.target_company,
        "compatibility_score": r.compatibility_score,
        "ats_score": r.ats_score,
        "semantic_similarity": r.semantic_similarity,
        "skills_match_percentage": r.skills_match_percentage,
        "matched_skills": json.loads(r.matched_skills_json) if r.matched_skills_json else [],
        "missing_skills": json.loads(r.missing_skills_json) if r.missing_skills_json else [],
        "recommendations": json.loads(r.recommendations_json) if r.recommendations_json else [],
        "learning_roadmap": json.loads(r.learning_roadmap_json) if r.learning_roadmap_json else [],
        "score_breakdown": json.loads(r.score_breakdown_json) if r.score_breakdown_json else {},
        "created_at": r.created_at
    }

