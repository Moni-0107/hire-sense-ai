import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FolderGit2,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { LearningItem, Resume, Job } from '../types';
import { Badge } from '../components/common/Badge';

export const SkillGapPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  const [roadmap, setRoadmap] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getResumes(), api.getJobs()]).then(([resList, jobList]) => {
      setResumes(resList);
      setJobs(jobList);
      if (resList.length > 0) setSelectedResumeId(resList[0].id);
      if (jobList.length > 0) setSelectedJobId(jobList[0].id);

      // Generate default roadmap
      generateRoadmap(resList[0]?.id, jobList[0]?.id);
    });
  }, []);

  const generateRoadmap = async (resumeId?: number, jobId?: number) => {
    if (!resumeId || !jobId) return;
    setLoading(true);
    try {
      const matchRes = await api.matchResume(resumeId, jobId);
      setRoadmap(matchRes.learning_roadmap);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const activeJob = jobs.find(j => j.id === selectedJobId);
  const activeResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Skill Gap Analysis & Learning Roadmap</h2>
        <p className="text-xs text-slate-500 mt-1">
          Bridge identified competency gaps with curated tutorials, official documentation, and hands-on portfolio projects.
        </p>
      </div>

      {/* Target Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Resume:
            </label>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedResumeId(id);
                generateRoadmap(id, selectedJobId || undefined);
              }}
              className="text-xs font-semibold p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-slate-50"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.candidate_name || r.file_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Target Job Role:
            </label>
            <select
              value={selectedJobId || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedJobId(id);
                generateRoadmap(selectedResumeId || undefined, id);
              }}
              className="text-xs font-semibold p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-slate-50"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>{roadmap.length} customized learning pathways generated</span>
        </div>
      </div>

      {/* Roadmap Items */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Synthesizing personalized learning roadmaps...</p>
          </div>
        </div>
      ) : roadmap.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Zero Skill Gaps Detected!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your resume already satisfies all core technical skills for this job opening. You are well prepared to submit your application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900">{item.skill}</span>
                    <Badge variant={item.importance === 'high' ? 'danger' : 'warning'} size="sm">
                      {item.importance === 'high' ? 'High Impact' : 'Recommended'}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.overview}
                </p>

                {/* Key Topics */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Key Topics to Master:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.recommended_topics.map((t, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hands-on Project & Resources */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100/80">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-700" /> Recommended Portfolio Project:
                  </span>
                  <p className="text-xs text-purple-950 leading-relaxed font-medium">
                    {item.hands_on_project}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Documentation:
                  </span>
                  {item.courses_or_docs.map((doc, dIdx) => (
                    <a
                      key={dIdx}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {doc.title} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

