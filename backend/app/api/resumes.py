import os
import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeDetailResponse
from app.services.resume_parser import resume_parser
from app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}

@router.post("/upload", response_model=ResumeDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a resume file (PDF, DOCX, TXT), parses candidate details, education,
    experience, projects, and skills, then computes an ATS score.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Read and check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
        )

    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text and parse
    raw_text = resume_parser.extract_text_from_file(file_path, ext)
    if not raw_text or len(raw_text.strip()) < 20:
        # Fallback to reading content directly as utf-8 / latin-1
        try:
            raw_text = content.decode('utf-8', errors='ignore')
        except Exception:
            raw_text = content.decode('latin-1', errors='ignore')

    parsed = resume_parser.parse(raw_text)
    ats_result = ats_scorer.calculate_ats_score(raw_text, parsed)

    # Create Resume record
    resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_type=ext,
        file_path=file_path,
        raw_text=raw_text,
        candidate_name=parsed.get("candidate_name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        linkedin_url=parsed.get("linkedin_url"),
        github_url=parsed.get("github_url"),
        education_json=json.dumps(parsed.get("education", [])),
        experience_json=json.dumps(parsed.get("experience", [])),
        skills_json=json.dumps(parsed.get("skills", [])),
        projects_json=json.dumps(parsed.get("projects", [])),
        certifications_json=json.dumps(parsed.get("certifications", [])),
        ats_score=ats_result.get("total_score", 0.0),
        score_breakdown_json=json.dumps(ats_result),
        improvement_suggestions_json=json.dumps(ats_result.get("suggestions", []))
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return _build_resume_detail_response(resume)

@router.get("/", response_model=List[ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all resumes uploaded by the current user."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return [_build_resume_summary(r) for r in resumes]

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_detail(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full parsed resume details, ATS score, and improvement suggestions."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return _build_resume_detail_response(resume)

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a resume and removes associated local files."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Clean local file
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    return None

def _build_resume_summary(resume: Resume) -> dict:
    skills = json.loads(resume.skills_json) if resume.skills_json else []
    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "file_name": resume.file_name,
        "file_type": resume.file_type,
        "candidate_name": resume.candidate_name,
        "email": resume.email,
        "phone": resume.phone,
        "linkedin_url": resume.linkedin_url,
        "github_url": resume.github_url,
        "skills": skills,
        "ats_score": resume.ats_score,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }

def _build_resume_detail_response(resume: Resume) -> dict:
    summary = _build_resume_summary(resume)
    breakdown = json.loads(resume.score_breakdown_json) if resume.score_breakdown_json else None
    suggestions = json.loads(resume.improvement_suggestions_json) if resume.improvement_suggestions_json else []
    
    summary.update({
        "education": json.loads(resume.education_json) if resume.education_json else [],
        "experience": json.loads(resume.experience_json) if resume.experience_json else [],
        "projects": json.loads(resume.projects_json) if resume.projects_json else [],
        "certifications": json.loads(resume.certifications_json) if resume.certifications_json else [],
        "score_breakdown": breakdown,
        "suggestions": suggestions,
        "raw_text_preview": (resume.raw_text[:600] + "...") if len(resume.raw_text) > 600 else resume.raw_text
    })
    return summary

