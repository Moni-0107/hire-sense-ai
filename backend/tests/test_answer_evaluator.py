import pytest
from app.services.answer_evaluator import answer_evaluator

def test_answer_evaluator_high_quality_response():
    model_answer = (
        "B+ Trees differ from B-Trees because internal nodes store only keys as routers "
        "while all data pointers reside in leaf nodes. Leaf nodes are linked sequentially in a "
        "doubly-linked list allowing O(log N) point lookups and fast range scans. Indexes speed up "
        "SELECT queries by avoiding full table scans but add write overhead for INSERT and UPDATE operations."
    )
    student_answer = (
        "In B+ Trees, internal nodes only store routing keys, and all actual record pointers are kept in the leaf nodes. "
        "These leaf nodes are connected in a linked list, which makes range queries and sequential scans very fast. "
        "Indexes optimize SELECT performance by reducing disk page reads, but they introduce write overhead on INSERT and UPDATE."
    )
    key_concepts = ["b+ tree", "leaf nodes", "sequential scan", "disk", "write overhead"]

    result = answer_evaluator.evaluate_answer(
        question_category="DBMS",
        problem_statement="Explain B+ Trees vs B-Trees and indexing",
        model_answer=model_answer,
        user_answer=student_answer,
        key_concepts=key_concepts
    )

    assert result["score"] >= 80.0
    assert result["keyword_coverage"] >= 75.0
    assert len(result["strengths"]) > 0

def test_answer_evaluator_brief_penalty():
    result = answer_evaluator.evaluate_answer(
        question_category="DBMS",
        problem_statement="Explain B+ Trees",
        model_answer="Long detailed explanation...",
        user_answer="It has leaf nodes.",
        key_concepts=["b+ tree", "leaf nodes", "range"]
    )

    assert result["score"] <= 30.0
    assert "too brief" in result["feedback"].lower()

def test_behavioral_star_method_scoring():
    star_answer = (
        "Situation: In my final year project, our team had to build a real-time chat application. "
        "Task: I was responsible for designing the database and websocket connection layer. "
        "Action: I implemented Redis pub/sub to handle websocket message broadcasting and wrote unit tests. "
        "Result: The system supported 10,000 concurrent users with under 50ms latency, and we won first place."
    )
    result = answer_evaluator.evaluate_answer(
        question_category="HR",
        problem_statement="Tell me about a challenging project",
        model_answer="Use STAR method...",
        user_answer=star_answer,
        key_concepts=["situation", "task", "action", "result"]
    )

    assert result["dimension_scores"]["structure_clarity"] == 100.0
    assert result["score"] >= 80.0

