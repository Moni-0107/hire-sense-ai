import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  FileText,
  Trash2,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisReport } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';

export const SavedReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const list = await api.getReports();
    setReports(list);
    if (list.length > 0 && !selectedReport) {
      setSelectedReport(list[0]);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this saved analysis report?")) {
      await api.deleteReport(id);
      const remaining = reports.filter(r => r.id !== id);
      setReports(remaining);
      setSelectedReport(remaining[0] || null);
    }
  };

  const filtered = reports.filter(r =>
    (r.job_title_target || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.target_company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Saved Analysis Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review, compare, and export past resume ATS audits and job compatibility reports.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No saved reports found.
            </div>
          ) : (
            filtered.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedReport?.id === rep.id
                    ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rep.job_title_target || "Target Role"}</h4>
                    <p className="text-xs text-purple-700 font-semibold">{rep.target_company || "Target Company"}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(rep.id); }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {Math.round(rep.compatibility_score)}% Match
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Report Inspection View */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedReport.job_title_target}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Evaluated for {selectedReport.target_company} • Generated on {new Date(selectedReport.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>

              {/* Gauge Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <ScoreGauge
                  score={selectedReport.compatibility_score}
                  title="Target Compatibility"
                  subtitle="Job Requirements Alignment"
                  size={160}
                />
                <ScoreGauge
                  score={selectedReport.ats_score}
                  title="Resume ATS Score"
                  subtitle="Standard Resume Quality"
                  size={160}
                />
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <span className="text-xs font-bold text-emerald-900 block mb-2">
                    Matched Skills ({selectedReport.matched_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReport.matched_skills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                  <span className="text-xs font-bold text-rose-900 block mb-2">
                    Skill Gaps Identified ({selectedReport.missing_skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReport.missing_skills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-rose-100/70 text-rose-800 font-medium">
                        ! {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Report Recommendations:</span>
                {selectedReport.recommendations.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/60">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a report from the list to view its complete audit details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

