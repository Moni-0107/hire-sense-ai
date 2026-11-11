import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Award,
  Zap,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Download,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { Resume } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const ResumeAnalyzerPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [activeTab, setActiveTab] = useState<'skills' | 'experience' | 'education' | 'projects'>('skills');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    const list = await api.getResumes();
    setResumes(list);
    if (list.length > 0 && !selectedResume) {
      setSelectedResume(list[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      setUploadError("Only PDF, DOCX, and TXT resume files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds maximum allowed size of 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await api.uploadResume(file);
      setResumes(prev => [uploaded, ...prev]);
      setSelectedResume(uploaded);
    } catch (err: any) {
      setUploadError("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      await api.deleteResume(id);
      const remaining = resumes.filter(r => r.id !== id);
      setResumes(remaining);
      setSelectedResume(remaining[0] || null);
    }
  };

  const loadSampleResume = (type: 'software' | 'data') => {
    if (type === 'software') {
      const sample = resumes.find(r => r.file_name.toLowerCase().includes('alex')) || resumes[0];
      if (sample) setSelectedResume(sample);
    }
  };

  const breakdown = selectedResume?.score_breakdown;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upload Zone & Resume Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Upload Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Resume for Analysis</h2>
              <p className="text-xs text-slate-500">Supports PDF, DOCX, and TXT files (up to 10MB)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quick Test:</span>
              <button
                onClick={() => loadSampleResume('software')}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition-colors"
              >
                Sample Resume
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-purple-600 bg-purple-50/50'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50/50'
            }`}
            onClick={() => document.getElementById('resume-file-input')?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-800">Parsing Resume & Calculating ATS Score...</p>
                <p className="text-xs text-slate-400">Running NLP Entity Extraction & TF-IDF vectorization</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3.5 rounded-full bg-purple-50 text-purple-600 mb-1">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload or drag & drop your resume file here
                </p>
                <p className="text-xs text-slate-500">
                  PDF or DOCX format recommended for best formatting analysis
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Existing Resumes Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Uploaded Resumes</h3>
            <p className="text-xs text-slate-500 mb-4">Select a resume to view detailed breakdown</p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {resumes.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResume(r)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedResume?.id === r.id
                      ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`w-5 h-5 shrink-0 ${selectedResume?.id === r.id ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{r.file_name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{r.file_type.toUpperCase()} • {r.skills.length} skills</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {Math.round(r.ats_score)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Active Selection:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[140px]">{selectedResume?.file_name}</span>
          </div>
        </div>
      </div>

      {selectedResume && (
        <>
          {/* Candidate Profile Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                {selectedResume.candidate_name ? selectedResume.candidate_name[0] : 'C'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedResume.candidate_name || "Candidate Name"}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                  {selectedResume.email && <span>{selectedResume.email}</span>}
                  {selectedResume.phone && <span>• {selectedResume.phone}</span>}
                  {selectedResume.linkedin_url && (
                    <a href={`https://${selectedResume.linkedin_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-0.5">
                      LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedResume.github_url && (
                    <a href={`https://${selectedResume.github_url.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-0.5">
                      GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Report
              </button>
            </div>
          </div>

          {/* ATS Score & Dimension Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Radial Gauge */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
              <ScoreGauge
                score={selectedResume.ats_score}
                title="Overall ATS Score"
                subtitle="Weighted across 5 key recruitment dimensions"
                size={200}
              />
              <div className="mt-4 w-full text-center">
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {selectedResume.ats_score >= 80
                    ? "Great job! This resume meets major Applicant Tracking System benchmarks."
                    : "Action required. Follow the recommendations below to pass initial automated screening."}
                </p>
              </div>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">ATS Dimension Breakdown</h4>
                <Badge variant="purple">Explainable Scoring</Badge>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                    <span>Section Completeness (Contact, Summary, Edu, Exp, Skills)</span>
                    <span className="font-bold text-slate-900">{breakdown?.sections_score ?? 20} / 20 pts</span>
                  </div>
                  <ProgressBar value={((breakdown?.sections_score ?? 20) / 20) * 100} showPercent={false} color="purple" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                    <span>Technical Keywords & Density</span>
                    <span className="font-bold text-slate-900">{breakdown?.keywords_score ?? 23} / 25 pts</span>
                  </div>
                  <ProgressBar value={((breakdown?.keywords_score ?? 23) / 25) * 100} showPercent={false} color="blue" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                    <span>Action Verbs Strength (Spearheaded, Architected, etc.)</span>
                    <span className="font-bold text-slate-900">{breakdown?.action_verbs_score ?? 15} / 20 pts</span>
                  </div>
                  <ProgressBar value={((breakdown?.action_verbs_score ?? 15) / 20) * 100} showPercent={false} color="emerald" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                    <span>Quantified Impact Metrics (%, $, numbers)</span>
                    <span className="font-bold text-slate-900">{breakdown?.quantified_impact_score ?? 15} / 20 pts</span>
                  </div>
                  <ProgressBar value={((breakdown?.quantified_impact_score ?? 15) / 20) * 100} showPercent={false} color="amber" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                    <span>Formatting, Length & Readability</span>
                    <span className="font-bold text-slate-900">{breakdown?.formatting_score ?? 15} / 15 pts</span>
                  </div>
                  <ProgressBar value={((breakdown?.formatting_score ?? 15) / 15) * 100} showPercent={false} color="purple" />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-slate-900 text-base">Actionable Resume Improvement Suggestions</h4>
              </div>
              <span className="text-xs text-slate-500">Categorized by priority impact</span>
            </div>

            <div className="space-y-3">
              {(selectedResume.suggestions && selectedResume.suggestions.length > 0) ? (
                selectedResume.suggestions.map((sugg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      sugg.severity === 'high'
                        ? 'bg-rose-50/50 border-rose-200'
                        : sugg.severity === 'medium'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          sugg.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : sugg.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sugg.severity} Priority
                        </span>
                        <span className="text-xs font-semibold text-slate-500">• {sugg.category}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{sugg.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{sugg.message}</p>
                    <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/60 text-xs font-medium text-slate-800 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                      <span>{sugg.recommendation}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No critical flaws detected! Your resume formatting and metrics are in top tier shape.
                </div>
              )}
            </div>
          </div>

          {/* Parsed Resume Sections Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'skills'
                    ? 'border-purple-600 text-purple-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                Detected Skills ({selectedResume.skills.length})
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'experience'
                    ? 'border-purple-600 text-purple-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Experience ({selectedResume.experience?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'education'
                    ? 'border-purple-600 text-purple-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Education ({selectedResume.education?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'projects'
                    ? 'border-purple-600 text-purple-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                Projects ({selectedResume.projects?.length || 0})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Recognized keywords extracted by our NLP taxonomy matching algorithm:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold capitalize"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {selectedResume.experience?.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-purple-200 pl-4 space-y-1.5">
                      <h5 className="font-bold text-slate-900 text-sm">{exp.title}</h5>
                      <p className="text-xs font-semibold text-purple-700">{exp.company} • {exp.duration || "Duration"}</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 mt-2">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  {selectedResume.education?.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h5 className="font-bold text-slate-900 text-sm">{edu.degree}</h5>
                      <p className="text-xs text-slate-600 mt-0.5">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                      {edu.gpa && <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-white border text-slate-700">GPA: {edu.gpa}</span>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  {selectedResume.projects?.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h5 className="font-bold text-slate-900 text-sm">{proj.name}</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                      {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {proj.tech_stack.map((t, tIdx) => (
                            <span key={tIdx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border text-purple-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

