import json
import os
from typing import List, Dict, Any

class SkillGapAnalyzer:
    def __init__(self):
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        resources_path = os.path.join(data_dir, "learning_resources.json")
        self.learning_resources = {}

        if os.path.exists(resources_path):
            try:
                with open(resources_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.learning_resources = data.get("resources", {})
            except Exception as e:
                print(f"Error loading learning resources: {e}")

    def generate_learning_roadmap(
        self,
        missing_skills: List[str],
        critical_skills: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Builds a customized learning roadmap for each missing skill,
        giving higher importance to critical job requirements.
        """
        roadmap = []
        default_res = self.learning_resources.get("default", {})

        for skill in missing_skills:
            skill_lower = skill.lower()
            is_critical = skill_lower in [c.lower() for c in critical_skills]
            
            # Lookup curated resource or generate intelligent fallback
            info = self.learning_resources.get(skill_lower)
            if not info:
                # Check partial match
                for key, val in self.learning_resources.items():
                    if key in skill_lower or skill_lower in key:
                        info = val
                        break

            if not info:
                info = {
                    "category": "Core Competency",
                    "overview": f"Gain industry-standard proficiency in {skill.capitalize()} to fulfill job requirements.",
                    "recommended_topics": [
                        f"{skill.capitalize()} architecture and basic syntax",
                        f"Integration and standard patterns with modern frameworks",
                        f"Performance optimization and common pitfalls",
                        f"Writing automated unit tests for {skill.capitalize()}"
                    ],
                    "courses_or_docs": [
                        {"title": f"{skill.capitalize()} Official Docs & Guide", "url": "https://devdocs.io"},
                        {"title": "Developer Learning Roadmap", "url": "https://roadmap.sh"}
                    ],
                    "hands_on_project": f"Create a portfolio project implementing {skill.capitalize()} with documentation and tests."
                }

            roadmap.append({
                "skill": skill.capitalize(),
                "category": info.get("category", "Technical Skill"),
                "importance": "high" if is_critical else "medium",
                "overview": info.get("overview", default_res.get("overview", "")),
                "recommended_topics": info.get("recommended_topics", default_res.get("recommended_topics", [])),
                "courses_or_docs": info.get("courses_or_docs", default_res.get("courses_or_docs", [])),
                "hands_on_project": info.get("hands_on_project", default_res.get("hands_on_project", ""))
            })

        # Sort: High importance first
        roadmap.sort(key=lambda x: 0 if x["importance"] == "high" else 1)
        return roadmap

skill_gap_analyzer = SkillGapAnalyzer()

