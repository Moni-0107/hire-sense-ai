import pytest
from app.services.nlp_engine import nlp_engine

def test_extract_skills():
    text = """
    Proficient in Python, React, TypeScript, and FastAPI.
    Hands-on experience with Docker, Kubernetes, PostgreSQL, and AWS.
    Built machine learning models using Scikit-Learn and Pandas.
    """
    skills = nlp_engine.extract_skills(text)
    
    assert "python" in skills
    assert "react" in skills
    assert "typescript" in skills
    assert "fastapi" in skills
    assert "docker" in skills
    assert "postgresql" in skills
    assert "aws" in skills

def test_extract_action_verbs():
    text = "Spearheaded the development of a microservice, architected the database, and optimized API latency."
    verbs = nlp_engine.extract_action_verbs(text)
    verb_names = [v["verb"] for v in verbs]
    
    assert "spearheaded" in verb_names
    assert "architected" in verb_names
    assert "optimized" in verb_names

def test_extract_quantified_metrics():
    text = "Reduced database query latency by 45%, increased quarterly revenue by $1.2M, and led a team of 8 engineers."
    metrics = nlp_engine.extract_quantified_metrics(text)
    
    assert any("45%" in m for m in metrics)
    assert any("$1.2M" in m for m in metrics)

def test_compute_cosine_similarity():
    text1 = "Senior Full-Stack Engineer with Python, React, PostgreSQL, Docker, and REST API experience."
    text2 = "Looking for a Python developer experienced in React, PostgreSQL, Docker, and cloud web APIs."
    text3 = "Pastry chef specializing in french patisserie, sourdough baking, and cake decoration."

    sim_high = nlp_engine.compute_cosine_similarity(text1, text2)
    sim_low = nlp_engine.compute_cosine_similarity(text1, text3)

    assert sim_high > 0.35
    assert sim_high > sim_low
