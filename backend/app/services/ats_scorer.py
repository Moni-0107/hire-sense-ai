from typing import Dict, Any, List
from app.services.nlp_engine import nlp_engine

class ATSScorer:
    def calculate_ats_score(self, raw_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates an explainable ATS-style resume score from 0 to 100
        broken down into 5 key evaluation dimensions.
        """
        words = nlp_engine.clean_text(raw_text).split()
        word_count = len(words)
        
        # 1. Section Completeness (Max: 20 pts)
        sections_score = 0.0
        sections_feedback = []
        
        has_contact = bool(parsed_data.get("email") or parsed_data.get("phone"))
        if has_contact:
            sections_score += 4.0
        else:
            sections_feedback.append("Missing explicit email or phone number in contact header.")

        has_education = len(parsed_data.get("education", [])) > 0
        if has_education:
            sections_score += 4.0
        else:
            sections_feedback.append("No clear education section detected.")

        has_experience = len(parsed_data.get("experience", [])) > 0
        if has_experience:
            sections_score += 4.0
        else:
            sections_feedback.append("Missing professional experience or employment history section.")

        has_skills = len(parsed_data.get("skills", [])) >= 3
        if has_skills:
            sections_score += 4.0
        else:
            sections_feedback.append("Technical skills section has fewer than 3 recognizable skills.")

        has_projects = len(parsed_data.get("projects", [])) > 0
        if has_projects:
            sections_score += 4.0
        else:
            sections_feedback.append("Consider adding a dedicated projects section to highlight hands-on work.")

        # 2. Formatting & Length (Max: 15 pts)
        formatting_score = 15.0
        formatting_feedback = []

        if word_count < 250:
            formatting_score -= 8.0
            formatting_feedback.append(f"Resume is too brief ({word_count} words). Aim for 450-800 words for standard 1-page ATS.")
        elif word_count > 1400:
            formatting_score -= 5.0
            formatting_feedback.append(f"Resume is lengthy ({word_count} words). Keep under 1,000 words unless having 10+ years experience.")
        
        # Check professional links
        has_linkedin = bool(parsed_data.get("linkedin_url"))
        has_github = bool(parsed_data.get("github_url"))
        if not has_linkedin and not has_github:
            formatting_score -= 2.0
            formatting_feedback.append("Add LinkedIn and GitHub/Portfolio links to increase recruiter trust.")

        formatting_score = max(0.0, formatting_score)

        # 3. Action Verbs Usage (Max: 20 pts)
        action_verbs_found = nlp_engine.extract_action_verbs(raw_text)
        total_action_verbs = sum(v["count"] for v in action_verbs_found)
        unique_action_verbs = len(action_verbs_found)

        if unique_action_verbs >= 8:
            action_verbs_score = 20.0
        elif unique_action_verbs >= 5:
            action_verbs_score = 16.0
        elif unique_action_verbs >= 3:
            action_verbs_score = 11.0
        elif unique_action_verbs >= 1:
            action_verbs_score = 6.0
        else:
            action_verbs_score = 2.0

        # 4. Quantified Impact & Metrics (Max: 20 pts)
        metrics_found = nlp_engine.extract_quantified_metrics(raw_text)
        metrics_count = len(metrics_found)

        if metrics_count >= 5:
            impact_score = 20.0
        elif metrics_count >= 3:
            impact_score = 15.0
        elif metrics_count >= 1:
            impact_score = 9.0
        else:
            impact_score = 2.0

        # 5. Technical Skills Breadth & Density (Max: 25 pts)
        skills = parsed_data.get("skills", [])
        skills_count = len(skills)

        if skills_count >= 12:
            keywords_score = 25.0
        elif skills_count >= 8:
            keywords_score = 20.0
        elif skills_count >= 5:
            keywords_score = 14.0
        elif skills_count >= 2:
            keywords_score = 8.0
        else:
            keywords_score = 3.0

        total_score = round(sections_score + formatting_score + action_verbs_score + impact_score + keywords_score, 1)
        total_score = min(100.0, max(0.0, total_score))

        # Generate Actionable Improvement Suggestions
        suggestions = []

        if impact_score < 15.0:
            suggestions.append({
                "category": "Impact & Results",
                "severity": "high",
                "title": "Quantify Achievements with Numbers",
                "message": f"Detected only {metrics_count} quantified metric(s). Recruiters and ATS prioritize resumes showing measurable impact.",
                "recommendation": "Use the Google XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'. Example: 'Reduced API response times by 35% through Redis caching'."
            })

        if action_verbs_score < 16.0:
            suggestions.append({
                "category": "Language & Tone",
                "severity": "medium",
                "title": "Diversify Strong Action Verbs",
                "message": f"Found {unique_action_verbs} unique power action verbs. Avoid passive phrases like 'responsible for' or 'helped with'.",
                "recommendation": "Start every bullet point with verbs like 'Spearheaded', 'Architected', 'Optimized', 'Automated', or 'Engineered'."
            })

        if keywords_score < 20.0:
            suggestions.append({
                "category": "Keywords & Skills",
                "severity": "high",
                "title": "Expand Technical Skills Keywords",
                "message": f"Only {skills_count} industry recognized skills detected in your resume.",
                "recommendation": "Include specific languages, databases, cloud tools (e.g., PostgreSQL, Docker, AWS), and libraries relevant to your target jobs."
            })

        if not has_github or not has_linkedin:
            suggestions.append({
                "category": "Profile Presentation",
                "severity": "medium",
                "title": "Add Online Portfolio & Profiles",
                "message": "Missing either LinkedIn URL or GitHub profile in your resume header.",
                "recommendation": "Add your clean GitHub (github.com/yourhandle) and customized LinkedIn URL at the very top of your resume."
            })

        if word_count < 300 or word_count > 1200:
            suggestions.append({
                "category": "Formatting",
                "severity": "low",
                "title": "Optimize Document Length",
                "message": f"Resume is currently {word_count} words.",
                "recommendation": "Maintain a concise single page (approx 450-700 words) for early-to-mid career professionals."
            })

        return {
            "total_score": total_score,
            "formatting_score": formatting_score,
            "sections_score": sections_score,
            "keywords_score": keywords_score,
            "action_verbs_score": action_verbs_score,
            "quantified_impact_score": impact_score,
            "metrics": {
                "word_count": word_count,
                "skills_count": skills_count,
                "action_verbs_count": total_action_verbs,
                "unique_action_verbs": unique_action_verbs,
                "top_action_verbs": [v["verb"] for v in action_verbs_found[:6]],
                "quantified_metrics_count": metrics_count,
                "sample_metrics": metrics_found[:4]
            },
            "suggestions": suggestions
        }

ats_scorer = ATSScorer()

