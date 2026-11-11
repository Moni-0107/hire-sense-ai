import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Code2,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { InterviewQuestion } from '../types';
import { Badge } from '../components/common/Badge';

interface QuestionBankPageProps {
  onSelectQuestionForPractice: (questionId: number) => void;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({
  onSelectQuestionForPractice
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [recommendations, setRecommendations] = useState<InterviewQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    'All',
    'DSA',
    'DBMS',
    'OOPs',
    'Python',
    'Java',
    'System Design',
    'Frontend',
    'Backend',
    'HR'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    const [qList, recList] = await Promise.all([
      api.getQuestions(selectedCategory, selectedDifficulty, searchTerm),
      api.getQuestionRecommendations()
    ]);
    setQuestions(qList);
    setRecommendations(recList);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  const recIds = new Set(recommendations.map(r => r.id));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Technical Interview Question Bank</h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore curated coding, system design, DBMS, and architectural interview challenges asked by top tech employers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or problem title (e.g. B-Trees, Two Sum, GIL)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            Search Questions
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Difficulty:
          </span>
          <div className="flex gap-1.5">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Loading interview questions...</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          No questions matched your search criteria. Try selecting "All" categories.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q) => {
            const isRec = recIds.has(q.id);
            const recInfo = recommendations.find(r => r.id === q.id);

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        {q.category}
                      </span>
                      {q.subtopic && (
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                          {q.subtopic}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={
                        q.difficulty === 'Hard'
                          ? 'danger'
                          : q.difficulty === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {q.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{q.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {q.problem_statement}
                  </p>

                  {/* Recommendation pill */}
                  {isRec && recInfo?.recommendation_reason && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{recInfo.recommendation_reason}</span>
                    </div>
                  )}

                  {/* Company tags */}
                  {q.company_tags && q.company_tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {q.company_tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {q.key_concepts.length} key concepts
                  </span>
                  <button
                    onClick={() => onSelectQuestionForPractice(q.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5" /> Practice Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

