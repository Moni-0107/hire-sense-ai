import json
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis_report import AnalysisReport

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns rich aggregated analytics for the candidate's personal dashboard:
    - Resume count & average ATS score
    - Latest ATS score & improvement trajectory
    - Skill distribution radar metrics
    - Match score history
    - Recent analysis reports
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    reports = db.query(AnalysisReport).filter(AnalysisReport.user_id == current_user.id).order_by(AnalysisReport.created_at.desc()).limit(10).all()

    total_resumes = len(resumes)
    avg_ats = round(sum(r.ats_score for r in resumes) / total_resumes, 1) if total_resumes > 0 else 0.0

    # Collect all detected skills across resumes
    all_skills = []
    for r in resumes:
        if r.skills_json:
            all_skills.extend(json.loads(r.skills_json))

    skill_counts = Counter(all_skills).most_common(10)
    top_skills = [{"skill": s, "count": c} for s, c in skill_counts]

    # Score breakdown averages from latest resume
    latest_resume = resumes[-1] if resumes else None
    latest_breakdown = None
    if latest_resume and latest_resume.score_breakdown_json:
        latest_breakdown = json.loads(latest_resume.score_breakdown_json)

    # Match history timeline
    match_history = [
        {
            "id": rep.id,
            "target": rep.job_title_target or "Target Role",
            "company": rep.target_company or "Company",
            "score": rep.compatibility_score,
            "date": rep.created_at.strftime("%b %d")
        }
        for rep in reversed(reports)
    ]

    return {
        "total_resumes": total_resumes,
        "average_ats_score": avg_ats,
        "latest_ats_score": latest_resume.ats_score if latest_resume else 0.0,
        "total_matches_run": len(reports),
        "top_skills": top_skills,
        "latest_score_breakdown": latest_breakdown,
        "match_history": match_history,
        "recent_reports": [
            {
                "id": rep.id,
                "job_title_target": rep.job_title_target,
                "target_company": rep.target_company,
                "compatibility_score": rep.compatibility_score,
                "ats_score": rep.ats_score,
                "matched_skills_count": len(json.loads(rep.matched_skills_json)) if rep.matched_skills_json else 0,
                "missing_skills_count": len(json.loads(rep.missing_skills_json)) if rep.missing_skills_json else 0,
                "created_at": rep.created_at
            }
            for rep in reports[:5]
        ]
    }

