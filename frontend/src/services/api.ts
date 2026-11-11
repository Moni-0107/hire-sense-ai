import {
  User,
  Resume,
  Job,
  MatchResult,
  AnalysisReport,
  InterviewQuestion,
  AnswerEvaluation,
  AttemptHistoryItem,
  UserPerformanceSummary
} from '../types';

const API_BASE = '/api/v1';

// Seed technical interview questions
const mockQuestions: InterviewQuestion[] = [
  {
    id: 1,
    category: "DBMS",
    subtopic: "Indexing & Query Optimization",
    title: "Explain B-Trees vs B+ Trees and how Indexes speed up SQL queries",
    difficulty: "Medium",
    problem_statement: "Describe the internal structure of B-Trees and B+ Trees in relational database management systems. How do indexes improve SELECT query performance, and what trade-offs exist with INSERT/UPDATE operations?",
    model_answer: "B+ Trees differ from standard B-Trees because internal nodes only store search keys as routers while all actual data pointers/records reside strictly in leaf nodes. Furthermore, leaf nodes are linked sequentially in a doubly-linked list, allowing O(log N) point lookups and fast range scans. Indexes speed up SELECT queries by avoiding full table scans but add write overhead for INSERT and UPDATE operations.",
    key_concepts: ["b+ tree", "leaf nodes", "sequential scan", "log n", "disk i/o", "write overhead", "indexing"],
    hints: ["Focus on where data pointers are stored in B+ Trees compared to B-Trees", "Mention range queries and sequential disk access"],
    company_tags: ["Google", "Amazon", "Oracle"],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    category: "DBMS",
    subtopic: "ACID Properties & Transactions",
    title: "What are ACID properties and isolation levels in relational databases?",
    difficulty: "Hard",
    problem_statement: "Explain the four ACID properties in DBMS. Detail the four SQL transaction isolation levels and describe the anomalies they prevent (dirty reads, non-repeatable reads, phantom reads).",
    model_answer: "ACID stands for Atomicity, Consistency, Isolation, and Durability. The four standard isolation levels from lowest to highest are: 1. Read Uncommitted, 2. Read Committed, 3. Repeatable Read, and 4. Serializable.",
    key_concepts: ["atomicity", "consistency", "isolation", "durability", "read committed", "repeatable read", "serializable", "dirty read", "phantom read"],
    hints: ["Break down each letter of ACID first", "Name the three read anomalies and which isolation level blocks each"],
    company_tags: ["Microsoft", "Amazon", "Uber"],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    category: "DSA",
    subtopic: "Arrays & Two Pointers",
    title: "Two Sum – Target Pair in Array",
    difficulty: "Easy",
    problem_statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may not use the same element twice. What is the optimal time and space complexity?",
    model_answer: "The optimal approach uses a Hash Map (dictionary) to store each visited number and its index. For each element, compute complement = target - nums[i]. If complement is in the map, return indices. Achieves O(N) linear time and O(N) space.",
    key_concepts: ["hash map", "complement", "o(n) time", "o(n) space", "lookup", "indices"],
    hints: ["Trade space for time using a hash table", "Store complement = target - current"],
    company_tags: ["Amazon", "Meta", "Google", "Apple"],
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    category: "DSA",
    subtopic: "Dynamic Programming",
    title: "Longest Increasing Subsequence (LIS)",
    difficulty: "Medium",
    problem_statement: "Given an integer array nums, return the length of the longest strictly increasing subsequence. Compare the O(N^2) DP approach with the optimal O(N log N) patience sorting / binary search approach.",
    model_answer: "The DP approach maintains dp[i] as the LIS ending at i with O(N^2) time. The optimal O(N log N) approach uses patience sorting with binary search (bisect_left) on a tails array.",
    key_concepts: ["dynamic programming", "subsequence", "o(n^2)", "binary search", "patience sorting", "o(n log n)"],
    hints: ["Define DP state clearly", "For O(N log N), explain how the tails array maintains the smallest tail of each length"],
    company_tags: ["Google", "Microsoft", "Meta"],
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    category: "OOPs",
    subtopic: "Four Pillars of OOP",
    title: "Explain the Four Pillars of Object-Oriented Programming with real-world examples",
    difficulty: "Easy",
    problem_statement: "Define Encapsulation, Abstraction, Inheritance, and Polymorphism. Explain how method overriding and method overloading demonstrate polymorphism, and provide practical software engineering scenarios for each.",
    model_answer: "Encapsulation bundles data and methods while hiding internal state. Abstraction exposes interfaces and hides implementation details. Inheritance enables code reuse across hierarchies. Polymorphism allows methods to take different forms at compile-time or runtime.",
    key_concepts: ["encapsulation", "abstraction", "inheritance", "polymorphism", "method overriding", "method overloading", "interface"],
    hints: ["Structure your answer into the 4 distinct pillars", "Differentiate compile-time vs runtime polymorphism clearly"],
    company_tags: ["Amazon", "TCS", "Infosys", "Adobe"],
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    category: "Python",
    subtopic: "Memory & Concurrency",
    title: "What is the Global Interpreter Lock (GIL) and how does Python handle concurrency?",
    difficulty: "Medium",
    problem_statement: "Explain what the GIL is in CPython. How does it affect multi-threading for CPU-bound vs I/O-bound tasks, and how should modern Python applications scale across multiple CPU cores?",
    model_answer: "The GIL is a mutex in CPython that ensures only one thread executes Python bytecode at any given time. For I/O-bound tasks, threads and asyncio work well because the GIL is released during I/O. For CPU-bound tasks, developers must use multiprocessing to utilize multiple physical CPU cores.",
    key_concepts: ["gil", "global interpreter lock", "cpython", "mutex", "cpu-bound", "i/o-bound", "multiprocessing", "asyncio"],
    hints: ["Distinguish between CPU-bound and I/O-bound workloads", "Explain multiprocessing vs multithreading"],
    company_tags: ["Meta", "Netflix", "Reddit"],
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    category: "System Design",
    subtopic: "Distributed Systems",
    title: "Design a Distributed Rate Limiter for High-Scale APIs",
    difficulty: "Hard",
    problem_statement: "How would you design a distributed rate limiter that limits users to 100 requests per minute across a cluster of 50 API gateway nodes? Compare Token Bucket, Leaky Bucket, and Sliding Window Log algorithms.",
    model_answer: "Use Redis with sliding window counter and Lua scripts to ensure atomic execution without race conditions. Token Bucket allows burstiness while Sliding Window Counter prevents boundary spikes with minimal memory.",
    key_concepts: ["token bucket", "sliding window", "redis", "lua script", "race condition", "atomicity", "api gateway"],
    hints: ["Discuss atomic operations to avoid concurrency race conditions", "Mention Redis Lua scripting for atomic check-and-increment"],
    company_tags: ["Google", "Stripe", "Uber", "Amazon"],
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    category: "HR",
    subtopic: "Behavioral & STAR Method",
    title: "Tell me about a time you had a technical disagreement with a teammate or lead",
    difficulty: "Medium",
    problem_statement: "Answer using the STAR method (Situation, Task, Action, Result). Demonstrate technical maturity, constructive collaboration, data-driven decision making, and professional conflict resolution.",
    model_answer: "Situation: Disagreement on whether to migrate SQL database to MongoDB. Task: Determine the best database architecture for financial transactional integrity. Action: Built an empirical benchmark demonstrating latency and integrity bottlenecks with prototype queries. Result: Lead agreed on benchmark data, stayed on PostgreSQL with JSONB columns, and delivered project 2 weeks early.",
    key_concepts: ["situation", "task", "action", "result", "star method", "data-driven", "collaboration", "conflict resolution"],
    hints: ["Never blame the teammate", "Focus on resolving conflicts using objective data and benchmarks"],
    company_tags: ["Amazon", "Google", "Microsoft", "Meta"],
    created_at: new Date().toISOString()
  }
];

let mockAttempts: AttemptHistoryItem[] = [
  {
    id: 1,
    question_id: 1,
    question_title: "Explain B-Trees vs B+ Trees and how Indexes speed up SQL queries",
    category: "DBMS",
    difficulty: "Medium",
    score: 86.5,
    semantic_similarity: 84.0,
    feedback: "Strong response! Clearly identified leaf node structures and sequential range scan advantages.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    question_id: 3,
    question_title: "Two Sum – Target Pair in Array",
    category: "DSA",
    difficulty: "Easy",
    score: 92.0,
    semantic_similarity: 90.0,
    feedback: "Excellent! Correctly implemented O(N) hash map solution with complement logic.",
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    question_id: 6,
    question_title: "What is the Global Interpreter Lock (GIL) and how does Python handle concurrency?",
    category: "Python",
    difficulty: "Medium",
    score: 78.0,
    semantic_similarity: 75.0,
    feedback: "Good explanation of GIL. Make sure to detail multiprocessing versus multithreading trade-offs.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Preserved Mock Seed Jobs & Resumes
const mockSeedJobs: Job[] = [
  {
    id: 1,
    title: "Senior Full-Stack Software Engineer",
    company: "TechNova Solutions",
    location: "San Francisco, CA (Hybrid / Remote)",
    employment_type: "Full-time",
    experience_level: "Senior",
    salary_range: "$140,000 - $175,000",
    description: "Architect and build next-generation software platforms using Python, FastAPI, React, TypeScript, Docker, and PostgreSQL.",
    required_skills: ["python", "fastapi", "react", "typescript", "postgresql", "docker", "rest api", "git"],
    preferred_skills: ["aws", "ci/cd", "redis", "tailwind css", "unit testing"],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Data Analyst & Business Intelligence Specialist",
    company: "Apex Analytics Group",
    location: "New York, NY (Remote)",
    employment_type: "Full-time",
    experience_level: "Mid-Level",
    salary_range: "$95,000 - $125,000",
    description: "Transform complex raw data into executive insights. Write complex SQL queries, build automated ETL data pipelines in Python, and build Tableau dashboards.",
    required_skills: ["sql", "python", "data analysis", "tableau", "power bi", "pandas"],
    preferred_skills: ["scikit-learn", "snowflake", "bigquery", "etl"],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Machine Learning & AI Engineer",
    company: "Cognitive AI Labs",
    location: "Austin, TX (Remote)",
    employment_type: "Full-time",
    experience_level: "Senior",
    salary_range: "$150,000 - $190,000",
    description: "Develop cutting-edge NLP and semantic search engines using spaCy, scikit-learn, PyTorch, and FastAPI microservices.",
    required_skills: ["python", "machine learning", "nlp", "scikit-learn", "pytorch", "fastapi", "docker"],
    preferred_skills: ["hugging face", "langchain", "aws", "kubernetes"],
    created_at: new Date().toISOString()
  }
];

let mockResumes: Resume[] = [
  {
    id: 1,
    user_id: 1,
    file_name: "Alex_Johnson_Software_Engineer_Resume.pdf",
    file_type: "pdf",
    candidate_name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "(555) 019-2834",
    linkedin_url: "linkedin.com/in/alexjohnson-dev",
    github_url: "github.com/alexjohnson",
    skills: ["python", "typescript", "javascript", "react", "fastapi", "postgresql", "docker", "aws", "git", "rest api", "redis", "ci/cd"],
    ats_score: 88.5,
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        year: "2015 – 2019",
        gpa: "3.85 / 4.0"
      }
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "CloudScale Systems",
        duration: "2021 – Present",
        bullets: [
          "Spearheaded architectural migration to FastAPI microservices, decreasing response times by 42%.",
          "Engineered high-throughput data processing pipeline handling 15M+ daily events with Redis & PostgreSQL.",
          "Implemented automated CI/CD workflows using GitHub Actions and Docker, reducing deployment time from 3 days to 25 mins.",
          "Mentored squad of 5 engineers and maintained 90%+ test coverage."
        ]
      }
    ],
    projects: [
      {
        name: "DevPrep AI – Intelligent Interview Prep Platform",
        tech_stack: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "scikit-learn"],
        description: "Built full-stack AI interview preparation platform utilizing NLP TF-IDF cosine similarity to score responses."
      }
    ],
    certifications: ["AWS Certified Solutions Architect – Associate", "Docker Certified Associate"],
    score_breakdown: {
      total_score: 88.5,
      formatting_score: 15.0,
      sections_score: 20.0,
      keywords_score: 23.5,
      action_verbs_score: 15.0,
      quantified_impact_score: 15.0
    },
    suggestions: [
      {
        category: "Action Verbs",
        severity: "medium",
        title: "Diversify Action Verbs in Older Roles",
        message: "You used strong verbs in recent roles. Expand verbs in earlier project descriptions.",
        recommendation: "Begin older bullet points with verbs like 'Formulated', 'Overhauled', or 'Automated'."
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const api = {
  getHeaders: () => {
    const token = localStorage.getItem('devprep_token') || localStorage.getItem('hiresense_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  // Auth
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const isAdmin = email.toLowerCase().includes('admin');
    const user: User = {
      id: isAdmin ? 99 : 1,
      email,
      full_name: isAdmin ? "DevPrep Admin" : (email.split('@')[0] || "Alex Johnson"),
      role: isAdmin ? "admin" : "candidate",
      created_at: new Date().toISOString()
    };
    return { access_token: "demo_devprep_jwt_" + Date.now(), user };
  },

  register: async (email: string, password: string, full_name: string, role = 'candidate'): Promise<{ access_token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name, role })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const user: User = {
      id: Math.floor(Math.random() * 1000) + 10,
      email,
      full_name,
      role: role as 'candidate' | 'admin',
      created_at: new Date().toISOString()
    };
    return { access_token: "demo_devprep_jwt_" + Date.now(), user };
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      id: 1,
      email: "candidate@devprep.ai",
      full_name: "Alex Johnson",
      role: "candidate",
      created_at: new Date().toISOString()
    };
  },

  // Technical Question Bank
  getQuestions: async (category?: string, difficulty?: string, query?: string): Promise<InterviewQuestion[]> => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
      if (query) params.append('q', query);
      const res = await fetch(`${API_BASE}/questions/?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    let filtered = [...mockQuestions];
    if (category && category !== 'All') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter(q => q.title.toLowerCase().includes(qLower) || q.problem_statement.toLowerCase().includes(qLower));
    }
    return filtered;
  },

  getQuestion: async (id: number): Promise<InterviewQuestion> => {
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockQuestions.find(q => q.id === id) || mockQuestions[0];
  },

  getQuestionRecommendations: async (targetRole = "Full-Stack Engineer"): Promise<InterviewQuestion[]> => {
    try {
      const res = await fetch(`${API_BASE}/questions/recommendations/me?target_role=${encodeURIComponent(targetRole)}`, {
        headers: api.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return mockQuestions.slice(0, 4).map((q, idx) => ({
      ...q,
      recommendation_score: 95.0 - idx * 5,
      recommendation_reason: idx === 0 ? "Strengthen weak topic: DBMS" : "Matches Python & SQL from your resume"
    }));
  },

  // Mock Interview AI Evaluation
  submitAnswer: async (questionId: number, userAnswer: string, timeSpentSeconds = 60): Promise<AnswerEvaluation> => {
    try {
      const res = await fetch(`${API_BASE}/interviews/evaluate`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
          time_spent_seconds: timeSpentSeconds
        })
      });
      if (res.ok) {
        const data = await res.json();
        mockAttempts.unshift({
          id: data.attempt_id,
          question_id: questionId,
          question_title: mockQuestions.find(q => q.id === questionId)?.title || "Interview Question",
          category: mockQuestions.find(q => q.id === questionId)?.category || "Technical",
          difficulty: mockQuestions.find(q => q.id === questionId)?.difficulty || "Medium",
          score: data.score,
          semantic_similarity: data.semantic_similarity,
          feedback: data.feedback,
          created_at: new Date().toISOString()
        });
        return data;
      }
    } catch (e) {}

    // Instant local evaluation fallback
    const q = mockQuestions.find(item => item.id === questionId) || mockQuestions[0];
    const words = userAnswer.trim().split(/\s+/).length;
    const matched = q.key_concepts.filter(k => userAnswer.toLowerCase().includes(k.toLowerCase()));
    const coverage = Math.round((matched.length / Math.max(1, q.key_concepts.length)) * 100);
    const score = words < 15 ? 30.0 : Math.min(95.0, Math.round(coverage * 0.5 + 45.0));

    const evalResult: AnswerEvaluation = {
      attempt_id: Date.now(),
      question_id: questionId,
      score: score,
      semantic_similarity: Math.round(score * 0.9),
      keyword_coverage: coverage,
      feedback: score >= 80
        ? "Excellent grasp of core architectural concepts and trade-offs!"
        : "Good attempt! Incorporate missing keywords and trade-offs to boost your score.",
      strengths: ["Addressed problem directly", "Demonstrated familiarity with terminology"],
      missing_concepts: q.key_concepts.filter(k => !matched.includes(k)),
      dimension_scores: {
        semantic_similarity: Math.round(score * 0.9),
        keyword_coverage: coverage,
        technical_depth: words >= 40 ? 90.0 : 65.0,
        structure_clarity: 85.0
      },
      model_answer: q.model_answer || "Refer to standard documentation."
    };

    mockAttempts.unshift({
      id: evalResult.attempt_id,
      question_id: questionId,
      question_title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      score: evalResult.score,
      semantic_similarity: evalResult.semantic_similarity,
      feedback: evalResult.feedback,
      created_at: new Date().toISOString()
    });

    return evalResult;
  },

  getAttemptHistory: async (): Promise<AttemptHistoryItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/interviews/history`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockAttempts;
  },

  getUserPerformance: async (): Promise<UserPerformanceSummary> => {
    try {
      const res = await fetch(`${API_BASE}/interviews/performance`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      total_questions_solved: mockAttempts.length,
      overall_average_score: 85.5,
      category_breakdown: [
        { category: "DSA", total_attempted: 3, average_score: 91.0, status: "Strong" },
        { category: "Python", total_attempted: 2, average_score: 82.5, status: "Strong" },
        { category: "DBMS", total_attempted: 2, average_score: 58.0, status: "Critical Weakness" },
        { category: "System Design", total_attempted: 1, average_score: 65.0, status: "Needs Practice" },
        { category: "HR", total_attempted: 1, average_score: 88.0, status: "Strong" }
      ],
      weak_topics: ["DBMS (Indexing & Isolation Levels)"],
      strong_topics: ["DSA (Arrays & Hash Maps)", "Python (Concurrency)"],
      recent_attempts: mockAttempts
    };
  },

  // Preserved Resumes & Matching
  getResumes: async (): Promise<Resume[]> => {
    try {
      const res = await fetch(`${API_BASE}/resumes/`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockResumes;
  },

  uploadResume: async (file: File): Promise<Resume> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('devprep_token') || localStorage.getItem('hiresense_token');
      const res = await fetch(`${API_BASE}/resumes/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        mockResumes.unshift(data);
        return data;
      }
    } catch (e) {}

    const newResume: Resume = {
      id: Date.now(),
      user_id: 1,
      file_name: file.name,
      file_type: file.name.split('.').pop()?.toLowerCase() || 'pdf',
      candidate_name: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "(555) 019-2834",
      skills: ["python", "react", "typescript", "fastapi", "postgresql", "docker", "git"],
      ats_score: 85.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockResumes.unshift(newResume);
    return newResume;
  },

  deleteResume: async (id: number): Promise<void> => {
    try {
      await fetch(`${API_BASE}/resumes/${id}`, { method: 'DELETE', headers: api.getHeaders() });
    } catch (e) {}
    mockResumes = mockResumes.filter(r => r.id !== id);
  },

  getJobs: async (): Promise<Job[]> => {
    try {
      const res = await fetch(`${API_BASE}/jobs/`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return mockSeedJobs;
  },

  matchResume: async (resumeId: number, jobId?: number, jobDescription?: string, jobTitle?: string, targetCompany?: string): Promise<MatchResult> => {
    try {
      const res = await fetch(`${API_BASE}/analysis/match`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          resume_id: resumeId,
          job_id: jobId,
          job_description: jobDescription,
          job_title: jobTitle,
          target_company: targetCompany
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      compatibility_score: 89.5,
      ats_score: 88.5,
      semantic_similarity: 86.0,
      skills_match_percentage: 92.0,
      matched_skills: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "Git"],
      missing_skills: ["Kubernetes", "Tailwind CSS"],
      missing_critical_skills: ["Kubernetes"],
      recommendations: ["Review distributed system design and Kubernetes concepts."],
      learning_roadmap: [
        {
          skill: "Kubernetes",
          category: "Cloud & DevOps",
          importance: "high",
          overview: "Automate container deployment and cluster scaling.",
          recommended_topics: ["Pods & Deployments", "Cluster Ingress", "Helm"],
          courses_or_docs: [{ title: "Kubernetes Docs", url: "https://kubernetes.io" }],
          hands_on_project: "Deploy microservice to local cluster."
        }
      ],
      score_breakdown: {
        skills_match: 92.0,
        semantic_similarity: 86.0,
        context_alignment: 90.0,
        overall_fit: 89.5,
        required_matched: 7,
        required_total: 8,
        preferred_matched: 3,
        preferred_total: 4
      },
      target_job_title: jobTitle || "Senior Full-Stack Engineer",
      target_company: targetCompany || "TechNova Solutions"
    };
  },

  getReports: async (): Promise<AnalysisReport[]> => {
    try {
      const res = await fetch(`${API_BASE}/analysis/reports`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  deleteReport: async (id: number): Promise<void> => {
    try {
      await fetch(`${API_BASE}/analysis/reports/${id}`, { method: 'DELETE', headers: api.getHeaders() });
    } catch (e) {}
  },

  getAdminStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      total_users: 142,
      total_resumes: 384,
      total_jobs: mockSeedJobs.length,
      total_analyses: 520,
      average_platform_ats_score: 79.4
    };
  },

  getAdminUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: api.getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, email: "alex.johnson@email.com", full_name: "Alex Johnson", role: "candidate", created_at: "2026-10-15T10:00:00Z", resumes_count: 3, analyses_count: 5 },
      { id: 2, email: "admin@devprep.ai", full_name: "DevPrep Admin", role: "admin", created_at: "2026-09-01T08:00:00Z", resumes_count: 0, analyses_count: 0 }
    ];
  },

  createJob: async (job: Partial<Job>): Promise<Job> => {
    try {
      const res = await fetch(`${API_BASE}/jobs/`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(job)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      id: Date.now(),
      title: job.title || "Software Engineer",
      company: job.company || "Company",
      location: job.location || "Remote",
      employment_type: job.employment_type || "Full-time",
      experience_level: job.experience_level || "Mid-Level",
      salary_range: job.salary_range,
      description: job.description || "",
      required_skills: job.required_skills || [],
      preferred_skills: job.preferred_skills || [],
      created_at: new Date().toISOString()
    };
  }
};
