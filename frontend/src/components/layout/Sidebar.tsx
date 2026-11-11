import React from 'react';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  UserCheck,
  BarChart3,
  FileText,
  Briefcase,
  Compass,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();

  const interviewHub = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'mock-interview', name: 'Mock Interview AI', icon: Code2, badge: 'Live AI' },
    { id: 'question-bank', name: 'Question Bank', icon: BookOpen, badge: 'Curated' },
    { id: 'hr-prep', name: 'HR & Behavioral', icon: UserCheck, badge: 'STAR' },
    { id: 'performance', name: 'Performance Analytics', icon: BarChart3 },
  ];

  const careerPrep = [
    { id: 'resume-analyzer', name: 'Resume Analyzer', icon: FileText, badge: 'ATS AI' },
    { id: 'job-matcher', name: 'Job Matcher', icon: Briefcase },
    { id: 'skill-gap', name: 'Skill Gap & Roadmap', icon: Compass },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1">
            DevPrep <span className="text-purple-400">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">
            Prepare Smarter. Get Hired.
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Section 1: Technical Interview Hub */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Technical Interview Hub
          </div>
          <div className="space-y-1">
            {interviewHub.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-800 text-purple-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-200" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Career Preparation */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Career Preparation
          </div>
          <div className="space-y-1">
            {careerPrep.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-800 text-purple-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-200" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Staff Portal */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Staff Portal
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-purple-300">Staff</span>
            </button>
          </div>
        )}
      </nav>

      {/* Pro Tips Box */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-800/90 border border-slate-750">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-200">Interview Tip</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          State your approach and space/time trade-offs before diving into code.
        </p>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-center text-[10px] text-slate-400">
        DevPrep AI v2.0 • Production
      </div>
    </aside>
  );
};
