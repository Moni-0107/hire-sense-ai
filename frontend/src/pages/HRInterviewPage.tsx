import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  Send,
  HelpCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { AnswerEvaluation } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { ProgressBar } from '../components/common/ProgressBar';

export const HRInterviewPage: React.FC = () => {
  const commonQuestions = [
    {
      id: 8,
      title: "Technical Disagreement with a Teammate or Lead",
      scenario: "Describe a situation where you had a strong technical disagreement regarding an architecture or implementation decision. How did you resolve it?",
      concepts: ["situation", "task", "action", "result", "star method", "data-driven", "collaboration", "conflict resolution"]
    },
    {
      id: 991,
      title: "Overcoming a Critical Production Outage or Bug",
      scenario: "Tell me about a high-pressure situation where a production bug or unexpected deployment failure occurred. How did you prioritize and solve it?",
      concepts: ["situation", "task", "action", "result", "root cause analysis", "calm under pressure", "blameless postmortem"]
    },
    {
      id: 992,
      title: "Balancing Competing Deadlines and Ambiguity",
      scenario: "Describe a project where requirements were vague or changing rapidly with tight deadlines. How did you manage stakeholders and ensure delivery?",
      concepts: ["situation", "task", "action", "result", "prioritization", "communication", "mvp", "agile"]
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);

  const activeQ = commonQuestions[selectedIdx];

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await api.submitAnswer(activeQ.id, userAnswer);
      setEvaluation(res);
    } catch (e) {
      // Fallback
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">HR & Behavioral Interview Preparation</h2>
        <p className="text-xs text-slate-500 mt-1">
          Master the industry standard STAR method (Situation, Task, Action, Result) for behavioral, culture-fit, and leadership interviews.
        </p>
      </div>

      {/* STAR Framework Explainer Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">S</span>
          <h4 className="font-bold text-slate-900 text-sm">Situation</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Set the context. Describe the project, company background, and specific challenge faced.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">T</span>
          <h4 className="font-bold text-slate-900 text-sm">Task</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            State your exact responsibility and role in solving the problem or meeting the objective.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">A</span>
          <h4 className="font-bold text-slate-900 text-sm">Action</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Detail the precise technical or interpersonal actions YOU took. Use "I" rather than "we".
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">R</span>
          <h4 className="font-bold text-slate-900 text-sm">Result</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quantify the outcome (e.g. 35% speedup, delivered on time) and what you learned.
          </p>
        </div>
      </div>

      {/* Main Practice Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Selector & Scenario */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Select Behavioral Prompt</h3>
            <div className="space-y-2">
              {commonQuestions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelectedIdx(idx); setUserAnswer(''); setEvaluation(null); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedIdx === idx
                      ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900">{q.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{q.scenario}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Example STAR Response Breakdown</h4>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
              <p><strong className="text-purple-700">Situation:</strong> In my previous role, our team proposed migrating to a NoSQL DB for faster initial iteration.</p>
              <p><strong className="text-blue-700">Task:</strong> As the API engineer, I had to ensure transactional consistency for client payments.</p>
              <p><strong className="text-emerald-700">Action:</strong> Rather than arguing subjectively, I created an objective benchmark prototype comparing 5 queries in PostgreSQL vs MongoDB.</p>
              <p><strong className="text-amber-700">Result:</strong> Lead agreed with empirical data; we adopted JSONB in Postgres, saving 35% latency with zero data corruption bugs.</p>
            </div>
          </div>
        </div>

        {/* Answer Input & Evaluation */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{activeQ.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeQ.scenario}</p>
            </div>

            <textarea
              rows={11}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Structure your answer using STAR: Situation... Task... Action... Result..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 font-sans leading-relaxed resize-y"
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-400">
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Auditing STAR Structure...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Evaluate STAR Response
                  </>
                )}
              </button>
            </div>
          </div>

          {evaluation && (
            <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Behavioral AI Score
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {Math.round(evaluation.score)} / 100
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                  <span>STAR Structure Adherence</span>
                  <span className="font-bold">{evaluation.dimension_scores.structure_clarity}%</span>
                </div>
                <ProgressBar value={evaluation.dimension_scores.structure_clarity} showPercent={false} color="purple" />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 text-xs text-slate-700 leading-relaxed">
                {evaluation.feedback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

