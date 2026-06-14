import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/Layout/AppLayout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Applications/Applications';
import Kanban from './pages/Kanban/Kanban';
import Analytics from './pages/Analytics/Analytics';
import ResumeAnalyzer from './pages/AI/ResumeAnalyzer';
import JobMatch from './pages/AI/JobMatch';
import CoverLetter from './pages/AI/CoverLetter';
import InterviewPrep from './pages/AI/InterviewPrep';
import Resumes from './pages/Resumes/Resumes';
import Interviews from './pages/Interviews/Interviews';
import Settings from './pages/Settings/Settings';
import Admin from './pages/Admin/Admin';
import { PageLoader } from './components/UI/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/ai/job-match" element={<JobMatch />} />
        <Route path="/ai/cover-letter" element={<CoverLetter />} />
        <Route path="/ai/interview-prep" element={<InterviewPrep />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
