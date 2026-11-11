from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.analysis_report import AnalysisReport

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Platform-level administrative metrics."""
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_jobs = db.query(Job).count()
    total_analyses = db.query(AnalysisReport).count()

    all_resumes = db.query(Resume).all()
    avg_platform_ats = round(sum(r.ats_score for r in all_resumes) / max(1, len(all_resumes)), 1) if all_resumes else 0.0

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_jobs": total_jobs,
        "total_analyses": total_analyses,
        "average_platform_ats_score": avg_platform_ats
    }

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lists all registered candidates and administrators."""
    users = db.query(User).offset(skip).limit(limit).all()
    results = []
    for u in users:
        resume_count = db.query(Resume).filter(Resume.user_id == u.id).count()
        analysis_count = db.query(AnalysisReport).filter(AnalysisReport.user_id == u.id).count()
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "created_at": u.created_at,
            "resumes_count": resume_count,
            "analyses_count": analysis_count
        })
    return results

