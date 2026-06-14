import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/applications': 'Applications',
  '/kanban': 'Kanban Board',
  '/analytics': 'Analytics',
  '/interviews': 'Interview Scheduler',
  '/resumes': 'Resume Manager',
  '/settings': 'Settings',
  '/admin': 'Admin Panel',
  '/ai/resume-analyzer': 'AI Resume Analyzer',
  '/ai/job-match': 'AI Job Match Score',
  '/ai/cover-letter': 'AI Cover Letter Generator',
  '/ai/interview-prep': 'AI Interview Preparation',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CareerFlow AI';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 max-w-screen-2xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
