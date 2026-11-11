import re
import math
import json
import os
from collections import Counter
from typing import List, Dict, Tuple, Set, Any

class NLPEngine:
    def __init__(self):
        # Load taxonomy
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        taxonomy_path = os.path.join(data_dir, "skills_taxonomy.json")
        
        self.skills_taxonomy: Dict[str, List[str]] = {}
        self.skill_aliases: Dict[str, str] = {}
        self.all_skills: Set[str] = set()

        if os.path.exists(taxonomy_path):
            try:
                with open(taxonomy_path, "r", encoding="utf-8") as f:
                    tax_data = json.load(f)
                    self.skills_taxonomy = tax_data.get("categories", {})
                    self.skill_aliases = tax_data.get("aliases", {})
                    for cat, skill_list in self.skills_taxonomy.items():
                        for s in skill_list:
                            self.all_skills.add(s.lower())
                    for alias in self.skill_aliases.keys():
                        self.all_skills.add(alias.lower())
            except Exception as e:
                print(f"Error loading taxonomy: {e}")

        # Common action verbs for resumes & engineering
        self.action_verbs = {
            "spearheaded", "architected", "engineered", "designed", "developed", "implemented",
            "optimized", "accelerated", "reduced", "increased", "maximized", "minimized",
            "orchestrated", "automated", "mentored", "led", "managed", "delivered", "deployed",
            "integrated", "authored", "resolved", "collaborated", "built", "created", "executed",
            "scaled", "transformed", "streamlined", "formulated", "established", "supervised",
            "generated", "boosted", "negotiated", "revamped", "directed", "pioneered"
        }

        # Common stop words
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any",
            "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
            "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did",
            "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few",
            "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
            "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
            "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
            "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
            "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
            "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
            "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
            "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
            "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
            "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
            "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
            "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
            "yourself", "yourselves", "will", "shall"
        }

    def clean_text(self, text: str) -> str:
        """Normalizes and cleans raw text."""
        if not text:
            return ""
        text = text.replace('\xa0', ' ')
        text = re.sub(r'[\r\n]+', '\n', text)
        return text.strip()

    def tokenize(self, text: str) -> List[str]:
        """Extracts words from text, lowercased and stripped of punctuation."""
        cleaned = re.sub(r'[^\w\s\+\#]', ' ', text.lower())
        tokens = [t.strip() for t in cleaned.split() if t.strip()]
        return [t for t in tokens if len(t) > 1 and t not in self.stop_words]

    def extract_skills(self, text: str) -> List[str]:
        """
        Extracts recognized technical and professional skills from text
        using multi-word n-gram and boundary regex matching against taxonomy.
        """
        if not text:
            return []
        
        lower_text = " " + text.lower() + " "
        found_skills = set()

        # Sort skills by length descending to match multi-word skills first
        sorted_skills = sorted(list(self.all_skills), key=lambda x: len(x), reverse=True)

        for skill in sorted_skills:
            escaped_skill = re.escape(skill)
            pattern = rf'(?<![a-zA-Z0-9]){escaped_skill}(?![a-zA-Z0-9])'
            
            if re.search(pattern, lower_text):
                canonical = self.skill_aliases.get(skill, skill)
                found_skills.add(canonical)

        return sorted(list(found_skills))

    def extract_action_verbs(self, text: str) -> List[Dict[str, Any]]:
        """Identifies action verbs and counts occurrences."""
        tokens = self.tokenize(text)
        verb_counts = Counter([t for t in tokens if t in self.action_verbs])
        return [{"verb": verb, "count": count} for verb, count in verb_counts.most_common()]

    def extract_quantified_metrics(self, text: str) -> List[str]:
        """Detects quantified achievements (percentages, revenue, team sizes, time reductions)."""
        metrics = []
        percentages = re.findall(r'\b\d+(?:\.\d+)?%', text)
        metrics.extend(percentages)

        currency = re.findall(r'\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s?[kKmMbB](?:illion)?)?', text)
        metrics.extend(currency)

        impact_phrases = re.findall(
            r'\b(?:reduced|increased|improved|boosted|grew|saved|managed|led)\s+[^.\n]{2,30}?\b\d+(?:[\w%+]+)?',
            text,
            flags=re.IGNORECASE
        )
        metrics.extend(impact_phrases)

        seen = set()
        unique_metrics = []
        for m in metrics:
            m_clean = m.strip()
            if m_clean.lower() not in seen:
                seen.add(m_clean.lower())
                unique_metrics.append(m_clean)
        return unique_metrics[:15]

    def extract_top_keywords(self, text: str, top_n: int = 15) -> List[Dict[str, Any]]:
        """Extracts top non-trivial keywords and phrases by term frequency."""
        tokens = self.tokenize(text)
        valid_tokens = [t for t in tokens if not t.isdigit() and len(t) > 2]
        
        counts = Counter(valid_tokens)
        bigrams = [f"{valid_tokens[i]} {valid_tokens[i+1]}" for i in range(len(valid_tokens)-1)]
        bigram_counts = Counter(bigrams)
        
        combined = []
        for word, count in counts.most_common(top_n):
            combined.append({"keyword": word, "frequency": count, "type": "unigram"})
        for bg, count in bigram_counts.most_common(5):
            if count > 1:
                combined.append({"keyword": bg, "frequency": count, "type": "bigram"})

        return combined[:top_n]

    def compute_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Computes Cosine Similarity between two texts.
        Uses term frequency vectors with sublinear scaling.
        """
        tokens1 = self.tokenize(text1)
        tokens2 = self.tokenize(text2)

        if not tokens1 or not tokens2:
            return 0.0

        tf1 = Counter(tokens1)
        tf2 = Counter(tokens2)

        vocab = set(tf1.keys()).union(set(tf2.keys()))

        dot_product = 0.0
        norm1 = 0.0
        norm2 = 0.0

        for word in vocab:
            w1 = (1.0 + math.log(tf1[word])) if word in tf1 else 0.0
            w2 = (1.0 + math.log(tf2[word])) if word in tf2 else 0.0

            dot_product += w1 * w2
            norm1 += w1 * w1
            norm2 += w2 * w2

        if norm1 <= 0 or norm2 <= 0:
            return 0.0

        similarity = dot_product / (math.sqrt(norm1) * math.sqrt(norm2))
        return round(float(similarity), 4)

nlp_engine = NLPEngine()
