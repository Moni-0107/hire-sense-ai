import pytest
from app.services.question_recommender import question_recommender

def test_question_recommender_weak_topic_boost():
    all_questions = [
        {"id": 1, "category": "DSA", "title": "Two Sum", "problem_statement": "Find pair", "key_concepts": ["hash map"]},
        {"id": 2, "category": "DBMS", "title": "B+ Tree Indexing", "problem_statement": "Explain B+ tree", "key_concepts": ["b+ tree"]},
        {"id": 3, "category": "Python", "title": "GIL Concurrency", "problem_statement": "Explain GIL", "key_concepts": ["gil"]},
    ]

    # User scored poorly in DBMS (40%) and high in DSA (90%)
    user_attempts = [
        {"question_id": 1, "category": "DSA", "score": 90.0},
        {"question_id": 2, "category": "DBMS", "score": 40.0}
    ]

    recommendations = question_recommender.recommend_questions(
        all_questions=all_questions,
        user_attempts=user_attempts,
        resume_skills=["python"],
        target_role="Backend Engineer",
        limit=3
    )

    # DBMS should be ranked high due to weak performance
    top_categories = [r["category"] for r in recommendations[:2]]
    assert "DBMS" in top_categories
    assert any("weak topic" in (r.get("recommendation_reason") or "").lower() for r in recommendations)

def test_question_recommender_resume_skill_match():
    all_questions = [
        {"id": 1, "category": "Java", "title": "JVM Memory", "problem_statement": "Heap vs Stack", "key_concepts": ["jvm"]},
        {"id": 2, "category": "Python", "title": "Python Decorators", "problem_statement": "Explain decorators", "key_concepts": ["python", "decorators"]},
    ]

    # User resume has Python skill
    recommendations = question_recommender.recommend_questions(
        all_questions=all_questions,
        user_attempts=[],
        resume_skills=["python"],
        target_role="Python Developer",
        limit=2
    )

    assert recommendations[0]["category"] == "Python"

