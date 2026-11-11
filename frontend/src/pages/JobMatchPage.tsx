import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building2,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { Resume, Job, MatchResult } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { ProgressBar } from '../components/common/ProgressBar';

interface JobMatchPageProps {
  onNavigateToRoadmap?: () => void;
}

export const JobMatchPage: React.FC<JobMatchPageProps> = ({ onNavigateToRoadmap }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  
  // Job selection mode: 'curated' or 'custom'
  const [jobMode, setJobMode] = useState<'curated' | 'custom'>('curated');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('Software Engineer');
  const [customCompany, setCustomCompany] = useState<string>('Target Inc.');
  const [customDescription, setCustomDescription] = useState<string>('');

  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getResumes(), api.getJobs()]).then(([resList, jobList]) => {
      setResumes(resList);
      if (resList.length > 0) setSelectedResumeId(resList[0].id);

      setJobs(jobList);
      if (jobList.length > 0) setSelectedJobId(jobList[0].id);
    });
  }, []);

  const handleRunMatch = async () => {
    if (!selectedResumeId) {
      setErrorMsg("Please select a resume to match.");
      return;
    }

    if (jobMode === 'custom' && (!customDescription || customDescription.trim().length < 20)) {
      setErrorMsg("Please paste a realistic job description (at least 20 characters).");
      return;
    }

    setErrorMsg(null);
    setIsMatching(true);

    try {
      const res = await api.matchResume(
        selectedResumeId,
        jobMode === 'curated' ? (selectedJobId || undefined) : undefined,
        jobMode === 'custom' ? customDescription : undefined,
        jobMode === 'custom' ? customTitle : undefined,
        jobMode === 'custom' ? customCompany : undefined
      );
      setMatchResult(res);
    } catch (e) {
      setErrorMsg("Error running AI matching algorithm. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const activeJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Job Compatibility Matcher</h2>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate resume fit against real job requirements using TF-IDF vector similarity and multi-category taxonomy overlap.
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Select Candidate Resume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900 text-sm">Select Candidate Resume</h3>
            </div>

            <div className="space-y-2.5">
              {resumes.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedResumeId === r.id
                      ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${selectedResumeId === r.id ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{r.file_name}</p>
                      <p className="text-[11px] text-slate-500">{r.candidate_name || "Candidate"} • {r.skills.length} skills</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                    ATS: {Math.round(r.ats_score)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Selected: <span className="font-semibold text-slate-700">{resumes.find(r => r.id === selectedResumeId)?.candidate_name || "Resume selected"}</span>
          </div>
        </div>

        {/* Step 2: Target Job Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-bold text-slate-900 text-sm">Choose Target Job Opening</h3>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setJobMode('curated')}
                  className={`px-2.5 py-1 rounded-md transition-all ${jobMode === 'curated' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Curated Openings
                </button>
                <button
                  onClick={() => setJobMode('custom')}
                  className={`px-2.5 py-1 rounded-md transition-all ${jobMode === 'custom' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Paste Custom JD
                </button>
              </div>
            </div>

            {jobMode === 'curated' ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {jobs.map(j => (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJobId(j.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedJobId === j.id
                        ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{j.title}</p>
                        <p className="text-[11px] text-purple-700 font-semibold">{j.company} • {j.location}</p>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {j.experience_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Senior Backend Eng)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Paste job description requirements, responsibilities, and qualifications here..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {jobMode === 'curated' ? activeJob?.title : customTitle}
            </span>
            <button
              onClick={handleRunMatch}
              disabled={isMatching}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {isMatching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Compute Compatibility
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Compatibility Result Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
              <ScoreGauge
                score={matchResult.compatibility_score}
                title="Job Compatibility Score"
                subtitle="Composite NLP Alignment"
                size={200}
              />
              <span className="text-xs font-bold text-slate-600 mt-2">
                Target: {matchResult.target_job_title}
              </span>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">NLP Multi-Factor Match Breakdown</h4>
                  <p className="text-xs text-slate-500">Evaluated against {matchResult.target_company || "Target Company"}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {matchResult.matched_skills.length} Matched Skills
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-700">Hard Technical Skills Overlap (Weight 45%)</span>
                    <span className="font-bold text-slate-900">{matchResult.skills_match_percentage}%</span>
                  </div>
                  <ProgressBar value={matchResult.skills_match_percentage} showPercent={false} color="purple" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-700">TF-IDF Semantic Text Similarity (Weight 35%)</span>
                    <span className="font-bold text-slate-900">{matchResult.semantic_similarity}%</span>
                  </div>
                  <ProgressBar value={matchResult.semantic_similarity} showPercent={false} color="blue" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-700">Job Title & Domain Alignment (Weight 20%)</span>
                    <span className="font-bold text-slate-900">{matchResult.score_breakdown.context_alignment || 85}%</span>
                  </div>
                  <ProgressBar value={matchResult.score_breakdown.context_alignment || 85} showPercent={false} color="emerald" />
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Matched Competencies ({matchResult.matched_skills.length})</h4>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These skills in your resume directly satisfy the target job requirements.
              </p>
              <div className="flex flex-wrap gap-2">
                {matchResult.matched_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Identified Skill Gaps ({matchResult.missing_skills.length})</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Target job mentions these competencies which are not explicitly prominent in your resume.
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
                    >
                      ! {s}
                    </span>
                  ))}
                </div>
              </div>

              {onNavigateToRoadmap && matchResult.missing_skills.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Need to bridge these gaps?</span>
                  <button
                    onClick={onNavigateToRoadmap}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    View Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Tailored Application Recommendations
            </h4>
            <div className="space-y-2">
              {matchResult.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

