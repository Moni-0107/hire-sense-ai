import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { UserPerformanceSummary } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';

interface PerformanceReportsPageProps {
  onPracticeTopic?: (category: string) => void;
}

export const PerformanceReportsPage: React.FC<PerformanceReportsPageProps> = ({
  onPracticeTopic
}) => {
  const [performance, setPerformance] = useState<UserPerformanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getUserPerformance().then((data) => {
      setPerformance(data);
      setLoading(false);
    });
  }, []);

  if (loading || !performance) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Aggregating interview performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance Analytics & Readiness Report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track interview practice velocity, identify diagnostic weak spots, and export your interview readiness transcript.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Download Performance Report
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions Practiced</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{performance.total_questions_solved}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Interview Score</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{performance.overall_average_score}%</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identified Weak Areas</span>
            <div className="mt-2 text-3xl font-extrabold text-rose-600">
              {performance.weak_topics.filter(t => !t.includes("None")).length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Weak Topics Warning Banner */}
      {performance.weak_topics.length > 0 && !performance.weak_topics[0].includes("None") && (
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">Diagnostic Action Recommended</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                You scored below 60% in: <strong>{performance.weak_topics.join(', ')}</strong>. Focusing your next practice sessions on these subjects will optimize your interview pass rate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown & Radar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Category Proficiency Matrix</h3>
            <span className="text-xs text-slate-400">Scored across attempts</span>
          </div>

          <div className="space-y-4 pt-1">
            {performance.category_breakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{cat.category} ({cat.total_attempted} solved)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      cat.status === 'Strong'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cat.status === 'Needs Practice'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {cat.status}
                    </span>
                    <span className="font-extrabold text-slate-800">{cat.average_score}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={cat.average_score}
                  showPercent={false}
                  color={cat.status === 'Strong' ? 'emerald' : cat.status === 'Needs Practice' ? 'amber' : 'rose'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Interview Readiness Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Readiness Evaluation</h3>
              <Badge variant="purple">AI Diagnostic</Badge>
            </div>

            <div className="py-4 flex justify-center">
              <ScoreGauge
                score={performance.overall_average_score}
                title="Interview Readiness Index"
                subtitle="Calibrated for Top IT & SDE Roles"
                size={180}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p><strong>Strongest Competencies:</strong> {performance.strong_topics.join(', ') || 'Keep practicing to establish high scores!'}</p>
              <p><strong>Target Next:</strong> {performance.weak_topics.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Practice History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Practice Session History</h3>
          <p className="text-xs text-slate-500">Log of evaluated answers with real-time feedback</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-6">Problem Title</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Difficulty</th>
                <th className="py-3 px-6">AI Score</th>
                <th className="py-3 px-6">Feedback Summary</th>
                <th className="py-3 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {performance.recent_attempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900 max-w-xs truncate">
                    {att.question_title}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[11px]">
                      {att.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">{att.difficulty}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    <span className={`px-2 py-0.5 rounded ${
                      att.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {Math.round(att.score)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 max-w-sm truncate">
                    {att.feedback || "Evaluated against model answer rubric."}
                  </td>
                  <td className="py-3.5 px-6 text-right text-slate-400">
                    {new Date(att.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

