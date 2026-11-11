import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { HRInterviewPage } from './pages/HRInterviewPage';
import { PerformanceReportsPage } from './pages/PerformanceReportsPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { JobMatchPage } from './pages/JobMatchPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPracticeQuestionId, setSelectedPracticeQuestionId] = useState<number | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  const handleNavigate = (tab: string, questionId?: number) => {
    if (questionId) {
      setSelectedPracticeQuestionId(questionId);
    }
    setActiveTab(tab);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {activeTab === 'mock-interview' && (
        <MockInterviewPage
          initialQuestionId={selectedPracticeQuestionId}
          onNavigateToQuestionBank={() => setActiveTab('question-bank')}
        />
      )}
      {activeTab === 'question-bank' && (
        <QuestionBankPage
          onSelectQuestionForPractice={(qId) => {
            setSelectedPracticeQuestionId(qId);
            setActiveTab('mock-interview');
          }}
        />
      )}
      {activeTab === 'hr-prep' && <HRInterviewPage />}
      {activeTab === 'performance' && (
        <PerformanceReportsPage onPracticeTopic={() => setActiveTab('question-bank')} />
      )}
      {activeTab === 'resume-analyzer' && <ResumeAnalyzerPage />}
      {activeTab === 'job-matcher' && (
        <JobMatchPage onNavigateToRoadmap={() => setActiveTab('skill-gap')} />
      )}
      {activeTab === 'skill-gap' && <SkillGapPage />}
      {activeTab === 'admin' && <AdminPage />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
