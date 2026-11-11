import pytest
from app.services.ats_scorer import ats_scorer

def test_ats_scorer_full_profile():
    sample_text = """
    Alex Johnson
    alex.johnson@email.com | (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexjohnson
    
    Professional Summary:
    Results-driven Senior Software Engineer with 5+ years of extensive experience building high-scale web platforms, distributed microservices, and high-throughput data processing systems. Proven track record in optimizing backend database architectures, reducing AWS infrastructure expenditure, and mentoring high-velocity engineering squads in fast-paced agile environments.
    
    Education:
    Bachelor of Science in Computer Science, University of California, Berkeley, 2020. Cumulative GPA: 3.8 / 4.0
    
    Experience:
    Senior Software Engineer at CloudTech Solutions (2021 - Present)
    - Architected distributed data ingestion pipeline reducing 99th percentile latency by 42% across 15M daily requests.
    - Spearheaded migration to Kubernetes container orchestration, scaling platform services to handle $2.5M in daily transactions.
    - Optimized complex PostgreSQL query execution plans and composite indexing, saving over $40,000 annually in AWS RDS infrastructure.
    - Mentored 4 junior software engineers in test-driven development, automated CI/CD workflows, and clean architecture practices.
    
    Software Engineer at NexaTech Innovations (2019 - 2021)
    - Developed customer-facing analytics dashboards using React, TypeScript, and Tailwind CSS serving 120,000+ monthly active users.
    - Built asynchronous RESTful APIs with FastAPI and Redis caching, achieving 99.98% uptime reliability across release cycles.
    
    Projects:
    - E-Commerce Microservices: Built using Python, FastAPI, React, Docker, and PostgreSQL with automated GitHub Actions CI/CD.
    - Distributed Task Scheduler: Implemented rate-limited task queue handling 5,000 requests per second with Redis and Prometheus metrics.
    
    Skills:
    Python, FastAPI, React, TypeScript, Docker, Kubernetes, PostgreSQL, AWS, Git, CI/CD, Redis, Microservices, SQL.
    """
    
    parsed_data = {
        "candidate_name": "Alex Johnson",
        "email": "alex.johnson@email.com",
        "phone": "(555) 123-4567",
        "linkedin_url": "linkedin.com/in/alexjohnson",
        "github_url": "github.com/alexjohnson",
        "education": [{"degree": "Bachelor of Science in Computer Science", "institution": "University of California, Berkeley"}],
        "experience": [{"title": "Senior Software Engineer", "company": "CloudTech Solutions"}],
        "skills": ["python", "fastapi", "react", "typescript", "docker", "kubernetes", "postgresql", "aws", "git", "ci/cd", "redis"],
        "projects": [{"name": "E-Commerce Microservices"}]
    }

    result = ats_scorer.calculate_ats_score(sample_text, parsed_data)
    
    assert result["total_score"] >= 80.0
    assert result["sections_score"] == 20.0
    assert result["action_verbs_score"] >= 15.0
    assert result["quantified_impact_score"] >= 15.0
