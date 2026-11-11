import React, { useState, useEffect } from 'react';
import {
  Code2,
  BookOpen,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { SkillsRadarChart } from '../components/dashboard/SkillsRadarChart';
import { MatchHistoryChart } from '../components/dashboard/MatchHistoryChart';
import { Badge } from '../components/common/Badge';
import { UserPerformanceSummary, InterviewQuestion } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string, questionId?: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [performance, setPerformance] = useState<UserPerformanceSummary | null>(null);
  const [recommendations, setRecommendations] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getUserPerformance(),
      api.getQuestionRecommendations()
    ]).then(([perf, recs]) => {
      setPerformance(perf);
      setRecommendations(recs);
      setLoading(false);
    });
  }, []);

  if (loading || !performance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading DevPrep AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Prepare Smarter. Code Better. Get Hired.
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Ace Your Next Software Engineering Interview.
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            AI-powered technical interview preparation and personalized learning platform. Practice curated coding challenges, evaluate system design answers in real-time with NLP, audit your resume against ATS benchmarks, and target your weak topics.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('mock-interview')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Code2 className="w-4 h-4" />
              Start Mock Interview
            </button>
            <button
              onClick={() => onNavigate('question-bank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 backdrop-blur-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              Explore Question Bank
            </button>
            <button
              onClick={() => onNavigate('resume-analyzer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4 text-purple-300" />
              Resume Analyzer & ATS
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions Solved</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{performance.total_questions_solved}</span>
            <span className="text-xs text-purple-600 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> High Velocity
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Interview Score</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{performance.overall_average_score}%</span>
            <span className="text-xs font-semibold text-emerald-600 ml-auto bg-emerald-50 px-2 py-0.5 rounded-full">
              Competitive
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identified Weak Areas</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {performance.weak_topics.filter(t => !t.includes("None")).length}
            </span>
            <span className="text-xs text-rose-600 font-semibold">Priority Focus</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume ATS Readiness</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">88.5</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
            <span className="text-xs font-semibold text-blue-600 ml-auto bg-blue-50 px-2 py-0.5 rounded-full">
              ATS Ready
            </span>
          </div>
        </div>
      </div>

      {/* Weak-Topic Recommended Action Card */}
      {performance.weak_topics.length > 0 && !performance.weak_topics[0].includes("None") && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">Targeted Diagnostic Recommendation</h4>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                Your performance indicates room for improvement in: <strong>{performance.weak_topics.join(', ')}</strong>. Practice questions in this category to eliminate critical interview blindspots.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('question-bank')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all shrink-0"
          >
            Practice Weak Topics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Radial Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Interview Readiness Index</h3>
              <p className="text-[11px] text-slate-500">Holistic technical & behavioral calibration</p>
            </div>
            <Badge variant="purple">AI Evaluated</Badge>
          </div>

          <div className="py-2">
            <ScoreGauge
              score={performance.overall_average_score || 85}
              title="Overall Interview Readiness"
              subtitle="Calibrated against FAANG & Tier-1 benchmarks"
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>DSA & Algorithms</span>
              <span className="font-bold text-slate-900">91%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Python & Backend</span>
              <span className="font-bold text-slate-900">82.5%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>DBMS & Indexing</span>
              <span className="font-bold text-rose-600">58% (Action item)</span>
            </div>
          </div>
        </div>

        {/* Competency Radar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Competency Distribution</h3>
              <p className="text-[11px] text-slate-500">Multi-axis proficiency mapping</p>
            </div>
            <Badge variant="primary">Multi-Topic</Badge>
          </div>

          <div className="py-2">
            <SkillsRadarChart />
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated across 6 major IT domains</span>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Match Trajectory Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Practice Velocity</h3>
              <p className="text-[11px] text-slate-500">Score trajectory across sessions</p>
            </div>
            <Badge variant="success">Trending Up</Badge>
          </div>

          <div className="py-2">
            <MatchHistoryChart />
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Continuous AI scoring</span>
            <button
              onClick={() => onNavigate('mock-interview')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Practice Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ML Recommended Questions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Personalized Question Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Recommended by DevPrep AI based on your resume skills and weak-topic diagnostics
            </p>
          </div>
          <button
            onClick={() => onNavigate('question-bank')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            All Questions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {q.category}
                  </span>
                  <Badge variant={q.difficulty === 'Hard' ? 'danger' : 'warning'} size="sm">
                    {q.difficulty}
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">{q.title}</h4>
                {q.recommendation_reason && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    {q.recommendation_reason}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => onNavigate('mock-interview', q.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  Practice Question <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
