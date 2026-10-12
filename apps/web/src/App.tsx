import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import RecruiterLayout from './components/layout/RecruiterLayout';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/recruiter/DashboardPage';
import JobsPage from './pages/recruiter/JobsPage';
import JobDetailPage from './pages/recruiter/JobDetailPage';
import PipelinePage from './pages/recruiter/PipelinePage';
import TalentPage from './pages/recruiter/TalentPage';
import CandidateProfilePage from './pages/recruiter/CandidateProfilePage';
import AnalyticsPage from './pages/recruiter/AnalyticsPage';
import TasksPage from './pages/recruiter/TasksPage';
import ClientsPage from './pages/recruiter/ClientsPage';
import SettingsPage from './pages/recruiter/SettingsPage';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ClientDashboard from './pages/client/ClientDashboard';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Recruiter workspace */}
      <Route element={<ProtectedRoute><RecruiterLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs/:id/pipeline" element={<PipelinePage />} />
        <Route path="/talent" element={<TalentPage />} />
        <Route path="/candidates/:id" element={<CandidateProfilePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Candidate portal */}
      <Route path="/candidate/*" element={<ProtectedRoute roles={['CANDIDATE']}><CandidateDashboard /></ProtectedRoute>} />

      {/* Client portal */}
      <Route path="/client/*" element={<ProtectedRoute roles={['CLIENT_ADMIN', 'CLIENT_USER']}><ClientDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
