import json
from typing import List, Dict, Any, Optional
from collections import defaultdict

class QuestionRecommender:
    def recommend_questions(
        self,
        all_questions: List[Dict[str, Any]],
        user_attempts: List[Dict[str, Any]],
        resume_skills: List[str],
        target_role: Optional[str] = "Full-Stack Engineer",
        limit: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Personalized Question Recommendation Model.
        Combines resume skills alignment, user weak-topic performance,
        and target role importance to rank interview questions.
        """
        # 1. Analyze performance per category
        category_scores = defaultdict(list)
        attempted_question_ids = set()

        for att in user_attempts:
            q_id = att.get("question_id")
            if q_id:
                attempted_question_ids.add(q_id)
            cat = att.get("category", "General")
            category_scores[cat].append(att.get("score", 0.0))

        # Calculate average score per category
        category_avg = {}
        for cat, scores in category_scores.items():
            category_avg[cat] = sum(scores) / len(scores)

        resume_skills_lower = [s.lower() for s in resume_skills]

        # 2. Score and rank every question
        ranked_questions = []

        for q in all_questions:
            q_id = q.get("id")
            category = q.get("category", "")
            title = q.get("title", "")
            problem = q.get("problem_statement", "")
            key_concepts = q.get("key_concepts", [])

            weight = 50.0  # Base score
            reasons = []

            # Factor A: Weak Topic Reinforcement (High Priority boost)
            if category in category_avg:
                avg = category_avg[category]
                if avg < 60.0:
                    weight += 35.0
                    reasons.append(f"Strengthen weak topic: {category} (Current average: {int(avg)}%)")
                elif avg < 75.0:
                    weight += 20.0
                    reasons.append(f"Reinforce intermediate topic: {category}")
            else:
                # Unattempted category boost
                weight += 15.0
                reasons.append(f"Explore unpracticed category: {category}")

            # Factor B: Resume Skill Alignment
            skill_hits = []
            for s in resume_skills_lower:
                if s in category.lower() or s in title.lower() or any(s in c.lower() for c in key_concepts):
                    skill_hits.append(s)

            if skill_hits:
                weight += 25.0
                reasons.append(f"Matches your resume skills: {', '.join([s.capitalize() for s in skill_hits[:2]])}")

            # Factor C: Target Role Affinity
            role_lower = (target_role or "").lower()
            if "frontend" in role_lower and category.lower() in ["frontend", "javascript", "react"]:
                weight += 20.0
                reasons.append(f"Essential for {target_role} interviews")
            elif "backend" in role_lower and category.lower() in ["backend", "dbms", "sql", "system design", "python", "java"]:
                weight += 20.0
                reasons.append(f"Core architectural topic for {target_role}")
            elif "full" in role_lower:
                weight += 10.0

            # Factor D: Freshness (Prioritize unattempted questions)
            if q_id in attempted_question_ids:
                weight -= 15.0  # Deprioritize already solved questions slightly

            question_copy = q.copy()
            question_copy["recommendation_score"] = round(weight, 1)
            question_copy["recommendation_reason"] = reasons[0] if reasons else f"Top interview question for {category}"
            ranked_questions.append(question_copy)

        # Sort descending by recommendation score
        ranked_questions.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return ranked_questions[:limit]

question_recommender = QuestionRecommender()

