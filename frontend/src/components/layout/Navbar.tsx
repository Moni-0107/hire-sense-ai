import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const { user, logout, isAdmin } = useAuth();

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Engineering Interview Dashboard';
      case 'mock-interview': return 'Mock Interview & Real-Time AI Evaluator';
      case 'question-bank': return 'Technical Interview Question Bank';
      case 'hr-prep': return 'HR & Behavioral Interview Prep (STAR Method)';
      case 'performance': return 'Performance Analytics & Downloadable Reports';
      case 'resume-analyzer': return 'Resume Analyzer & Explainable ATS Scorer';
      case 'job-matcher': return 'Job Compatibility Matcher';
      case 'skill-gap': return 'Skill Gap Analysis & Learning Roadmap';
      case 'admin': return 'Administrator Control Center';
      default: return 'DevPrep AI';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">{getPageTitle(activeTab)}</h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">Prepare Smarter. Code Better. Get Hired.</p>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {isAdmin && (
          <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
            <Shield className="w-3.5 h-3.5" /> Staff Admin
          </span>
        )}

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 text-xs font-medium text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">AI Evaluation Engine:</span>
          <span className="text-purple-700 font-semibold">Active</span>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || "Alex Johnson"}</p>
            <p className="text-[10px] text-slate-500 leading-tight capitalize">{user?.role || "Candidate"}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
