import React, { useState, useEffect } from 'react';
import {
  Code2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Send,
  Eye,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { InterviewQuestion, AnswerEvaluation } from '../types';
import { ScoreGauge } from '../components/dashboard/ScoreGauge';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

interface MockInterviewPageProps {
  initialQuestionId?: number | null;
  onNavigateToQuestionBank?: () => void;
}

export const MockInterviewPage: React.FC<MockInterviewPageProps> = ({
  initialQuestionId,
  onNavigateToQuestionBank
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getQuestions().then((list) => {
      setQuestions(list);
      if (initialQuestionId) {
        const found = list.find((q) => q.id === initialQuestionId);
        if (found) setSelectedQuestion(found);
        else setSelectedQuestion(list[0]);
      } else if (list.length > 0 && !selectedQuestion) {
        setSelectedQuestion(list[0]);
      }
    });
  }, [initialQuestionId]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionChange = (qId: number) => {
    const q = questions.find((item) => item.id === qId);
    if (q) {
      setSelectedQuestion(q);
      setUserAnswer('');
      setEvaluation(null);
      setSeconds(0);
      setIsTimerRunning(true);
      setShowHints(false);
      setShowModelAnswer(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion) return;
    if (!userAnswer.trim()) {
      setErrorMsg("Please write your answer before submitting.");
      return;
    }

    setErrorMsg(null);
    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const res = await api.submitAnswer(selectedQuestion.id, userAnswer, seconds);
      setEvaluation(res);
    } catch (e) {
      setErrorMsg("Error evaluating answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedQuestion) return;
    const currentIndex = questions.findIndex((q) => q.id === selectedQuestion.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    handleQuestionChange(questions[nextIndex].id);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mock Interview Practice Room</h2>
            <p className="text-xs text-slate-500">Real-time evaluation against industry standard rubrics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{formatTimer(seconds)}</span>
          </div>

          <select
            value={selectedQuestion?.id || ''}
            onChange={(e) => handleQuestionChange(Number(e.target.value))}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-600 bg-slate-50 max-w-[280px] truncate"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.category}] {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Details Column */}
          <div className="space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">{selectedQuestion.category}</Badge>
                  {selectedQuestion.subtopic && (
                    <span className="text-xs font-medium text-slate-500">• {selectedQuestion.subtopic}</span>
                  )}
                </div>
                <Badge
                  variant={
                    selectedQuestion.difficulty === 'Hard'
                      ? 'danger'
                      : selectedQuestion.difficulty === 'Medium'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                >
                  {selectedQuestion.difficulty}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {selectedQuestion.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line font-medium">
                  {selectedQuestion.problem_statement}
                </p>
              </div>

              {/* Company Tags */}
              {selectedQuestion.company_tags && selectedQuestion.company_tags.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400">Asked At:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuestion.company_tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Concepts */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Expected Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedQuestion.key_concepts.map((concept, idx) => (
                    <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hints Drawer */}
              {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHints ? "Hide Hints" : "Need a Hint?"}
                  </button>

                  {showHints && (
                    <ul className="mt-2.5 space-y-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700">
                      {selectedQuestion.hints.map((hint, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Canonical Model Answer (Unlocked after submission or toggle) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Benchmark Model Answer</h4>
                </div>
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  {showModelAnswer ? "Hide" : "Reveal Model Answer"}
                </button>
              </div>

              {showModelAnswer ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                  {selectedQuestion.model_answer || evaluation?.model_answer || "Refer to the model answer rubric."}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Model answer is hidden to encourage authentic practice. Reveal it to cross-reference after submitting.
                </p>
              )}
            </div>
          </div>

          {/* Answer Input & AI Evaluation Column */}
          <div className="space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Your Technical Response</h4>
                <span className="text-xs text-slate-400 font-medium">
                  {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                rows={12}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Explain your approach, architectural rationale, time/space complexity trade-offs, and edge cases here..."
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 font-sans leading-relaxed resize-y"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setUserAnswer('')}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear Answer
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Evaluating via AI...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit for AI Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Real-time AI Evaluation Card */}
            {evaluation && (
              <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-md space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-slate-900 text-sm">AI Evaluation Report</h4>
                  </div>
                  <Badge variant="purple">Rubric Scored</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1 flex justify-center">
                    <ScoreGauge
                      score={evaluation.score}
                      title="Answer Score"
                      subtitle="Weighted Rubric"
                      size={150}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-700">Semantic Similarity to Model</span>
                        <span className="font-bold text-slate-900">{evaluation.semantic_similarity}%</span>
                      </div>
                      <ProgressBar value={evaluation.semantic_similarity} showPercent={false} color="purple" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-700">Technical Concept Coverage</span>
                        <span className="font-bold text-slate-900">{evaluation.keyword_coverage}%</span>
                      </div>
                      <ProgressBar value={evaluation.keyword_coverage} showPercent={false} color="blue" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-700">Technical Depth & Elaboration</span>
                        <span className="font-bold text-slate-900">
                          {evaluation.dimension_scores.technical_depth}%
                        </span>
                      </div>
                      <ProgressBar value={evaluation.dimension_scores.technical_depth} showPercent={false} color="emerald" />
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-purple-900 block mb-1">AI Evaluator Feedback:</span>
                  {evaluation.feedback}
                </div>

                {/* Strengths & Missing Concepts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {evaluation.strengths.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <span className="font-bold text-emerald-900 block mb-1">Strengths Demonstrated:</span>
                      <ul className="space-y-1 text-slate-700">
                        {evaluation.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.missing_concepts.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                      <span className="font-bold text-rose-900 block mb-1">Concepts to Add:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {evaluation.missing_concepts.map((c, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

