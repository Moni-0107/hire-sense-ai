export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'candidate' | 'admin';
  created_at: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  year?: string;
  gpa?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration?: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  tech_stack: string[];
  description: string;
}

export interface SuggestionItem {
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  recommendation: string;
}

export interface AtsScoreBreakdown {
  total_score: number;
  formatting_score: number;
  sections_score: number;
  keywords_score: number;
  action_verbs_score: number;
  quantified_impact_score: number;
  metrics?: {
    word_count: number;
    skills_count: number;
    action_verbs_count: number;
    unique_action_verbs: number;
    top_action_verbs: string[];
    quantified_metrics_count: number;
    sample_metrics: string[];
  };
  suggestions?: SuggestionItem[];
}

export interface Resume {
  id: number;
  user_id: number;
  file_name: string;
  file_type: string;
  candidate_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  skills: string[];
  ats_score: number;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  certifications?: string[];
  score_breakdown?: AtsScoreBreakdown;
  suggestions?: SuggestionItem[];
  raw_text_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  created_at: string;
  compatibility_score?: number;
  matched_skills?: string[];
  missing_critical_skills?: string[];
}

export interface LearningItem {
  skill: string;
  category: string;
  importance: 'high' | 'medium';
  overview: string;
  recommended_topics: string[];
  courses_or_docs: Array<{ title: string; url: string }>;
  hands_on_project: string;
}

export interface MatchResult {
  compatibility_score: number;
  ats_score: number;
  semantic_similarity: number;
  skills_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  missing_critical_skills: string[];
  recommendations: string[];
  learning_roadmap: LearningItem[];
  score_breakdown: {
    skills_match: number;
    semantic_similarity: number;
    context_alignment: number;
    overall_fit: number;
    required_matched: number;
    required_total: number;
    preferred_matched: number;
    preferred_total: number;
  };
  target_job_title?: string;
  target_company?: string;
}

export interface AnalysisReport {
  id: number;
  user_id: number;
  resume_id: number;
  job_id?: number;
  job_title_target?: string;
  target_company?: string;
  compatibility_score: number;
  ats_score: number;
  semantic_similarity: number;
  skills_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  learning_roadmap: LearningItem[];
  score_breakdown: Record<string, any>;
  created_at: string;
}

// DevPrep AI Interview Platform Types
export interface InterviewQuestion {
  id: number;
  category: string; // DSA, DBMS, OOPs, SQL, Python, Java, System Design, Frontend, Backend, HR
  subtopic?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problem_statement: string;
  model_answer?: string;
  key_concepts: string[];
  hints: string[];
  company_tags: string[];
  recommendation_score?: number;
  recommendation_reason?: string;
  created_at: string;
}

export interface AnswerEvaluation {
  attempt_id: number;
  question_id: number;
  score: number;
  semantic_similarity: number;
  keyword_coverage: number;
  feedback: string;
  strengths: string[];
  missing_concepts: string[];
  dimension_scores: {
    semantic_similarity: number;
    keyword_coverage: number;
    technical_depth: number;
    structure_clarity: number;
  };
  model_answer: string;
}

export interface AttemptHistoryItem {
  id: number;
  question_id: number;
  question_title: string;
  category: string;
  difficulty: string;
  score: number;
  semantic_similarity: number;
  feedback?: string;
  created_at: string;
}

export interface CategoryPerformance {
  category: string;
  total_attempted: number;
  average_score: number;
  status: 'Strong' | 'Needs Practice' | 'Critical Weakness';
}

export interface UserPerformanceSummary {
  total_questions_solved: number;
  overall_average_score: number;
  category_breakdown: CategoryPerformance[];
  weak_topics: string[];
  strong_topics: string[];
  recent_attempts: AttemptHistoryItem[];
}
