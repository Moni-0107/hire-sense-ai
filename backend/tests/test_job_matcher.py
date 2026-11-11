import pytest
from app.services.job_matcher import job_matcher

def test_job_matcher_high_match():
    resume_text = "Experienced Full-Stack Developer with Python, FastAPI, React, PostgreSQL, Docker, and AWS."
    resume_skills = ["python", "fastapi", "react", "postgresql", "docker", "aws", "git"]
    
    job_description = "We are seeking a Python and React developer skilled in FastAPI, PostgreSQL, and Docker containerization."
    required_skills = ["python", "fastapi", "react", "postgresql"]
    preferred_skills = ["docker", "aws"]

    result = job_matcher.match(
        resume_text=resume_text,
        resume_skills=resume_skills,
        job_description=job_description,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        job_title="Full-Stack Developer"
    )

    assert result["compatibility_score"] >= 75.0
    assert result["skills_match_percentage"] == 100.0
    assert len(result["missing_critical_skills"]) == 0

def test_job_matcher_skill_gap_generation():
    resume_text = "Junior frontend developer with HTML, CSS, JavaScript, and React experience."
    resume_skills = ["html", "css", "javascript", "react"]
    
    job_description = "Data Scientist needed. Must know Python, PyTorch, Scikit-Learn, SQL, and Docker."
    required_skills = ["python", "pytorch", "scikit-learn", "sql"]
    preferred_skills = ["docker"]

    result = job_matcher.match(
        resume_text=resume_text,
        resume_skills=resume_skills,
        job_description=job_description,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        job_title="Data Scientist"
    )

    assert result["compatibility_score"] < 50.0
    assert len(result["missing_critical_skills"]) >= 3
    assert len(result["learning_roadmap"]) > 0
    # Check roadmap contains learning guidance for missing skills
    assert any(item["skill"].lower() in ["python", "pytorch", "scikit-learn", "sql"] for item in result["learning_roadmap"])

