from typing import Dict, Any, List, Optional
from app.services.nlp_engine import nlp_engine
from app.services.skill_gap_analyzer import skill_gap_analyzer

class JobMatcher:
    def match(
        self,
        resume_text: str,
        resume_skills: List[str],
        job_description: str,
        required_skills: Optional[List[str]] = None,
        preferred_skills: Optional[List[str]] = None,
        job_title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Computes multi-dimensional compatibility between candidate resume and job posting.
        """
        # If skills not explicitly passed, extract them via NLP from job description
        if not required_skills or len(required_skills) == 0:
            job_extracted_skills = nlp_engine.extract_skills(job_description)
            # Partition into required and preferred
            mid = max(1, int(len(job_extracted_skills) * 0.65))
            required_skills = job_extracted_skills[:mid]
            preferred_skills = job_extracted_skills[mid:]

        resume_skills_lower = set([s.lower() for s in resume_skills])
        required_lower = [s.lower() for s in (required_skills or [])]
        preferred_lower = [s.lower() for s in (preferred_skills or [])]

        all_target_skills = set(required_lower + preferred_lower)

        # 1. Skills Matching
        matched_required = [s for s in required_lower if s in resume_skills_lower]
        missing_critical = [s for s in required_lower if s not in resume_skills_lower]

        matched_preferred = [s for s in preferred_lower if s in resume_skills_lower]
        missing_preferred = [s for s in preferred_lower if s not in resume_skills_lower]

        all_matched = sorted(list(set(matched_required + matched_preferred)))
        all_missing = sorted(list(set(missing_critical + missing_preferred)))

        total_target_count = len(all_target_skills)
        if total_target_count > 0:
            # Required skills carry 75% weight of skill portion, preferred carry 25%
            req_ratio = len(matched_required) / max(1, len(required_lower)) if required_lower else 1.0
            pref_ratio = len(matched_preferred) / max(1, len(preferred_lower)) if preferred_lower else 1.0
            
            skills_match_pct = round((0.75 * req_ratio + 0.25 * pref_ratio) * 100, 1)
        else:
            skills_match_pct = 50.0

        # 2. Semantic Similarity via TF-IDF Cosine Similarity
        cosine_sim = nlp_engine.compute_cosine_similarity(resume_text, job_description)
        # Scale to 0-100 range
        semantic_score = round(min(100.0, cosine_sim * 140.0), 1)

        # 3. Job Title and Context Alignment
        title_alignment_score = 50.0
        if job_title:
            title_words = [w.lower() for w in job_title.split() if len(w) > 3 and w.lower() not in nlp_engine.stop_words]
            if title_words:
                matches = sum(1 for w in title_words if w in resume_text.lower())
                title_alignment_score = round(min(100.0, (matches / len(title_words)) * 100), 1)

        # Composite Compatibility Score
        # 45% Hard skills match, 35% Semantic Similarity, 20% Context/Title alignment
        composite_score = round(
            (0.45 * skills_match_pct) + (0.35 * semantic_score) + (0.20 * title_alignment_score),
            1
        )
        composite_score = max(0.0, min(100.0, composite_score))

        # Targeted recommendations
        recommendations = []
        if missing_critical:
            top_missing = ", ".join([s.capitalize() for s in missing_critical[:3]])
            recommendations.append(
                f"Critical Skill Gap: The job strongly requires {top_missing}. Adding these or related competencies to your resume will dramatically increase interview call rates."
            )

        if cosine_sim < 0.35:
            recommendations.append(
                "Keyword Density & Terminology: The phrasing in your resume differs from this job description. Incorporate industry-standard keywords and phrasing from the job posting into your project descriptions."
            )

        if len(matched_required) >= max(1, len(required_lower) * 0.7):
            recommendations.append(
                "Strong Core Alignment: You have the primary skills required! Make sure these matched skills are prominently featured in your experience bullet points, not just in a skills list."
            )

        if not recommendations:
            recommendations.append(
                "High Alignment: Your resume aligns well with this role. Tailor your summary statement to explicitly mention the company name and target role title."
            )

        # Generate Learning Roadmap for missing skills
        learning_roadmap = skill_gap_analyzer.generate_learning_roadmap(
            missing_skills=all_missing[:6],
            critical_skills=missing_critical
        )

        return {
            "compatibility_score": composite_score,
            "semantic_similarity": round(cosine_sim * 100, 1),
            "skills_match_percentage": skills_match_pct,
            "title_alignment_score": title_alignment_score,
            "matched_skills": [s.capitalize() for s in all_matched],
            "missing_skills": [s.capitalize() for s in all_missing],
            "missing_critical_skills": [s.capitalize() for s in missing_critical],
            "recommendations": recommendations,
            "learning_roadmap": learning_roadmap,
            "score_breakdown": {
                "skills_match": skills_match_pct,
                "semantic_similarity": round(cosine_sim * 100, 1),
                "context_alignment": title_alignment_score,
                "overall_fit": composite_score,
                "required_matched": len(matched_required),
                "required_total": len(required_lower),
                "preferred_matched": len(matched_preferred),
                "preferred_total": len(preferred_lower)
            }
        }

job_matcher = JobMatcher()

