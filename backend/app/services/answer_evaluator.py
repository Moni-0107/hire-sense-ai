import re
from typing import Dict, Any, List, Optional
from app.services.nlp_engine import nlp_engine

class AnswerEvaluator:
    def __init__(self):
        # STAR method indicators for behavioral evaluation
        self.star_indicators = {
            "situation": ["situation", "context", "background", "when i was", "at my previous", "in my project", "team had to"],
            "task": ["task", "challenge", "responsibility", "my goal", "needed to", "assigned to", "responsible for"],
            "action": ["action", "i implemented", "i designed", "i created", "i decided", "i organized", "i led", "i built", "i developed"],
            "result": ["result", "outcome", "impact", "reduced", "increased", "achieved", "learned", "delivered", "won", "supported"]
        }

    def evaluate_answer(
        self,
        question_category: str,
        problem_statement: str,
        model_answer: str,
        user_answer: str,
        key_concepts: List[str]
    ) -> Dict[str, Any]:
        """
        Evaluates a candidate's technical or HR interview response
        against the reference model answer and key concept rubrics.
        """
        user_clean = nlp_engine.clean_text(user_answer)
        user_lower = " " + user_clean.lower() + " "
        word_count = len(user_clean.split())

        if word_count < 10:
            return {
                "score": 15.0,
                "semantic_similarity": 10.0,
                "keyword_coverage": 0.0,
                "feedback": "Answer is too brief. Provide a comprehensive explanation detailing concepts, trade-offs, and examples.",
                "strengths": ["Submitted an initial attempt"],
                "missing_concepts": key_concepts[:5],
                "dimension_scores": {
                    "semantic_similarity": 10.0,
                    "keyword_coverage": 0.0,
                    "technical_depth": 10.0,
                    "structure_clarity": 20.0
                }
            }

        # 1. Semantic Similarity (35% weight)
        cosine_sim = nlp_engine.compute_cosine_similarity(user_clean, model_answer)
        # Scaled smoothly: cosine_sim >= 0.4 indicates strong alignment
        semantic_score = round(min(100.0, cosine_sim * 180.0), 1)

        # 2. Key Concept Rubric Coverage (35% weight)
        matched_concepts = []
        missing_concepts = []

        for concept in key_concepts:
            concept_lower = concept.lower()
            escaped = re.escape(concept_lower)
            if re.search(rf'\b{escaped}\b', user_lower) or concept_lower in user_lower:
                matched_concepts.append(concept)
            else:
                missing_concepts.append(concept)

        total_concepts = len(key_concepts)
        coverage_pct = round((len(matched_concepts) / max(1, total_concepts)) * 100, 1) if total_concepts > 0 else 80.0

        # 3. Technical Depth & Elaboration (15% weight)
        if word_count >= 50:
            depth_score = 100.0
        elif word_count >= 30:
            depth_score = 85.0
        elif word_count >= 20:
            depth_score = 65.0
        else:
            depth_score = 35.0

        # 4. Structure & Clarity (15% weight)
        structure_score = 85.0
        if question_category.upper() == "HR":
            star_found = sum(
                1 for _, phrases in self.star_indicators.items()
                if any(p in user_lower for p in phrases)
            )
            structure_score = round((star_found / 4.0) * 100, 1)

        # Weighted Final Score (0 - 100)
        final_score = round(
            (0.35 * max(semantic_score, coverage_pct * 0.9)) +
            (0.35 * coverage_pct) +
            (0.15 * depth_score) +
            (0.15 * structure_score),
            1
        )
        final_score = min(100.0, max(5.0, final_score))

        # Identify strengths
        strengths = []
        if coverage_pct >= 70.0:
            strengths.append(f"Demonstrated solid grasp of key terminology ({len(matched_concepts)} concepts mentioned).")
        if depth_score >= 80.0:
            strengths.append("Provided a well-elaborated response with adequate technical depth.")
        if semantic_score >= 60.0:
            strengths.append("High semantic alignment with industry-standard engineering explanations.")
        if not strengths:
            strengths.append("Attempted the question and outlined core ideas.")

        # Construct actionable feedback
        if missing_concepts:
            missing_str = ", ".join([f"'{c}'" for c in missing_concepts[:4]])
            feedback = f"Solid foundation! To achieve a top-tier score, be sure to explicitly discuss: {missing_str}. Elaborate on the underlying trade-offs and complexity."
        else:
            feedback = "Outstanding response! You clearly articulated all core concepts and trade-offs expected by top tech interviewers."

        return {
            "score": final_score,
            "semantic_similarity": semantic_score,
            "keyword_coverage": coverage_pct,
            "feedback": feedback,
            "strengths": strengths,
            "missing_concepts": missing_concepts,
            "dimension_scores": {
                "semantic_similarity": semantic_score,
                "keyword_coverage": coverage_pct,
                "technical_depth": depth_score,
                "structure_clarity": structure_score
            }
        }

answer_evaluator = AnswerEvaluator()
