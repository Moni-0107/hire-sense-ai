import re
import os
from typing import Dict, Any, List, Optional
from app.services.nlp_engine import nlp_engine

class ResumeParser:
    def __init__(self):
        self.email_regex = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
        self.phone_regex = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
        self.linkedin_regex = re.compile(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+', re.IGNORECASE)
        self.github_regex = re.compile(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+', re.IGNORECASE)
        
        # Section header patterns
        self.section_headers = {
            "summary": re.compile(r'^(?:professional\s+summary|summary|profile|about\s+me|objective)\b', re.IGNORECASE | re.MULTILINE),
            "education": re.compile(r'^(?:education|academic\s+background|qualifications|academics)\b', re.IGNORECASE | re.MULTILINE),
            "experience": re.compile(r'^(?:work\s+experience|professional\s+experience|experience|employment\s+history)\b', re.IGNORECASE | re.MULTILINE),
            "skills": re.compile(r'^(?:technical\s+skills|skills|technologies|core\s+competencies|tools\s+&\s+technologies)\b', re.IGNORECASE | re.MULTILINE),
            "projects": re.compile(r'^(?:projects|personal\s+projects|academic\s+projects|key\s+projects)\b', re.IGNORECASE | re.MULTILINE),
            "certifications": re.compile(r'^(?:certifications|licenses|certificates|achievements)\b', re.IGNORECASE | re.MULTILINE),
        }

    def extract_text_from_file(self, file_path: str, file_type: str) -> str:
        """Extracts text from PDF, DOCX, or TXT file."""
        if not os.path.exists(file_path):
            return ""

        file_type = file_type.lower().strip('.')

        if file_type == "txt":
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception:
                with open(file_path, "r", encoding="latin-1", errors="ignore") as f:
                    return f.read()

        elif file_type == "pdf":
            # Try pypdf / pypdf2 / pdfplumber or fallback
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                pages_text = [page.extract_text() or "" for page in reader.pages]
                return "\n".join(pages_text)
            except Exception:
                try:
                    import PyPDF2
                    reader = PyPDF2.PdfReader(file_path)
                    pages_text = [page.extract_text() or "" for page in reader.pages]
                    return "\n".join(pages_text)
                except Exception:
                    # Fallback text scan for demo / uninstalled library
                    with open(file_path, "rb") as f:
                        raw = f.read()
                    # Extract readable ASCII strings from PDF stream
                    strings = re.findall(b"[\x20-\x7e\r\n]{4,}", raw)
                    return "\n".join([s.decode('latin-1', errors='ignore') for s in strings])

        elif file_type in ["docx", "doc"]:
            try:
                import docx
                doc = docx.Document(file_path)
                full_text = []
                for para in doc.paragraphs:
                    full_text.append(para.text)
                for table in doc.tables:
                    for row in table.rows:
                        full_text.append(" | ".join([cell.text.strip() for cell in row.cells]))
                return "\n".join(full_text)
            except Exception:
                # Fallback reading
                with open(file_path, "rb") as f:
                    raw = f.read()
                strings = re.findall(b"[\x20-\x7e\r\n]{4,}", raw)
                return "\n".join([s.decode('latin-1', errors='ignore') for s in strings])

        return ""

    def parse_candidate_name(self, text: str, lines: List[str]) -> str:
        """Infers candidate name from the top header lines of the resume."""
        for line in lines[:8]:
            clean = line.strip()
            # Ignore lines with email, urls, or common words
            if not clean or self.email_regex.search(clean) or "@" in clean or "http" in clean or "/" in clean:
                continue
            if len(clean) > 40:
                continue
            words = clean.split()
            # Most names are 2 to 4 capitalized words without digits
            if 1 < len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()) and not any(ch.isdigit() for ch in clean):
                return clean
        return "Candidate"

    def split_into_sections(self, text: str) -> Dict[str, str]:
        """Segments raw resume text into distinct logical sections."""
        lines = text.split("\n")
        sections: Dict[str, List[str]] = {
            "header": [],
            "summary": [],
            "education": [],
            "experience": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "other": []
        }

        current_section = "header"

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            matched_section = None
            # Check if this line looks like a section header
            if len(line_str) < 45:
                for sec_name, pattern in self.section_headers.items():
                    if pattern.search(line_str):
                        matched_section = sec_name
                        break

            if matched_section:
                current_section = matched_section
            else:
                sections[current_section].append(line_str)

        return {k: "\n".join(v) for k, v in sections.items()}

    def parse_education(self, text: str) -> List[Dict[str, Any]]:
        """Extracts degrees, institutions, and graduation years."""
        items = []
        degree_patterns = [
            r'(?:Bachelor(?:\'s)?|Master(?:\'s)?|Doctor|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|B\.?Tech|M\.?Tech|Ph\.?D\.?)\s+(?:of|in)?\s+[A-Za-z\s,]+',
            r'(?:Computer Science|Information Technology|Data Science|Software Engineering|Electrical Engineering)\b'
        ]
        year_pattern = r'\b(19\d{2}|20\d{2})\b(?:\s*[-–to]+\s*(19\d{2}|20\d{2}|present|current))?'
        gpa_pattern = r'\b(?:GPA|CGPA)[:\s]*([0-4](?:\.\d{1,2})?|[0-9](?:\.\d{1,2})?\/10)\b'

        lines = [l.strip() for l in text.split("\n") if l.strip()]
        for i, line in enumerate(lines):
            found_degree = None
            for p in degree_patterns:
                match = re.search(p, line, re.IGNORECASE)
                if match:
                    found_degree = match.group(0).strip()
                    break

            if found_degree:
                year_match = re.search(year_pattern, line, re.IGNORECASE)
                gpa_match = re.search(gpa_pattern, line, re.IGNORECASE)
                
                # Check preceding or following line for institution name
                institution = "University / College"
                if i > 0 and len(lines[i-1]) < 60 and not re.search(degree_patterns[0], lines[i-1], re.IGNORECASE):
                    institution = lines[i-1]
                elif i + 1 < len(lines) and ("university" in lines[i+1].lower() or "institute" in lines[i+1].lower() or "college" in lines[i+1].lower()):
                    institution = lines[i+1]

                items.append({
                    "institution": institution,
                    "degree": found_degree,
                    "year": year_match.group(0) if year_match else None,
                    "gpa": gpa_match.group(1) if gpa_match else None
                })

        # Fallback if no specific degree found
        if not items and text.strip():
            items.append({
                "institution": "Educational Institution",
                "degree": "Degree in Computer Science or Related Field",
                "year": None,
                "gpa": None
            })

        return items

    def parse_experience(self, text: str) -> List[Dict[str, Any]]:
        """Extracts work roles, companies, and bullet points."""
        items = []
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        current_role: Optional[Dict[str, Any]] = None
        title_indicators = ["engineer", "developer", "analyst", "scientist", "manager", "lead", "intern", "architect", "specialist"]

        for line in lines:
            # Bullet point detection
            is_bullet = line.startswith(('-', '•', '*', '–', '+', '›')) or re.match(r'^\d+\.', line)
            lower_line = line.lower()
            
            # Check if line looks like a job title
            is_title = any(ind in lower_line for ind in title_indicators) and len(line) < 70 and not is_bullet

            if is_title:
                if current_role:
                    items.append(current_role)
                
                # Split title and company if separated by '|', '-', 'at', '@'
                title = line
                company = "Company / Organization"
                if " at " in line:
                    parts = line.split(" at ")
                    title, company = parts[0], parts[1]
                elif " | " in line:
                    parts = line.split(" | ")
                    title, company = parts[0], parts[1]
                elif " - " in line and not line.startswith("-"):
                    parts = line.split(" - ")
                    title, company = parts[0], parts[1]

                current_role = {
                    "title": title.strip(),
                    "company": company.strip(),
                    "duration": "Past Experience",
                    "bullets": []
                }
            elif current_role and is_bullet:
                clean_bullet = re.sub(r'^[-•*–+\d\.]\s*', '', line).strip()
                if clean_bullet:
                    current_role["bullets"].append(clean_bullet)
            elif current_role and len(line) > 20:
                current_role["bullets"].append(line)

        if current_role:
            items.append(current_role)

        # Fallback
        if not items and text.strip():
            bullets = [l for l in lines if len(l) > 20]
            items.append({
                "title": "Software Engineer / Professional Experience",
                "company": "Industry Experience",
                "duration": "Previous Role",
                "bullets": bullets[:5]
            })

        return items

    def parse_projects(self, text: str) -> List[Dict[str, Any]]:
        """Extracts key projects, tech stacks, and descriptions."""
        items = []
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        current_project: Optional[Dict[str, Any]] = None

        for line in lines:
            is_bullet = line.startswith(('-', '•', '*', '–', '+'))
            # Project title header detection
            if not is_bullet and len(line) < 60 and not line.endswith('.'):
                if current_project:
                    items.append(current_project)

                tech_stack = nlp_engine.extract_skills(line)
                name = re.sub(r'\|.*$', '', line).strip()
                current_project = {
                    "name": name,
                    "tech_stack": tech_stack,
                    "description": ""
                }
            elif current_project:
                # Add to description and extract skills
                current_project["description"] += (" " + line)
                found_skills = nlp_engine.extract_skills(line)
                for s in found_skills:
                    if s not in current_project["tech_stack"]:
                        current_project["tech_stack"].append(s)

        if current_project:
            items.append(current_project)

        return items

    def parse(self, raw_text: str) -> Dict[str, Any]:
        """Main parse method orchestrating all extraction sub-routines."""
        cleaned = nlp_engine.clean_text(raw_text)
        lines = cleaned.split("\n")

        # Contact Info
        email_match = self.email_regex.search(cleaned)
        phone_match = self.phone_regex.search(cleaned)
        linkedin_match = self.linkedin_regex.search(cleaned)
        github_match = self.github_regex.search(cleaned)

        candidate_name = self.parse_candidate_name(cleaned, lines)
        sections = self.split_into_sections(cleaned)

        # Extract structured entities
        education = self.parse_education(sections.get("education", "") or cleaned)
        experience = self.parse_experience(sections.get("experience", "") or cleaned)
        projects = self.parse_projects(sections.get("projects", ""))

        # Skills extraction from entire document
        skills = nlp_engine.extract_skills(cleaned)

        # Certifications extraction
        cert_text = sections.get("certifications", "")
        certifications = [c.strip() for c in cert_text.split("\n") if len(c.strip()) > 3] if cert_text else []

        return {
            "candidate_name": candidate_name,
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
            "linkedin_url": linkedin_match.group(0) if linkedin_match else None,
            "github_url": github_match.group(0) if github_match else None,
            "sections": sections,
            "education": education,
            "experience": experience,
            "projects": projects,
            "skills": skills,
            "certifications": certifications
        }

resume_parser = ResumeParser()

