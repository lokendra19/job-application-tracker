import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Kanban, BarChart3, Brain, FileText,
  Calendar, Settings, Shield, ChevronRight, Zap, LogOut, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/kanban', icon: Kanban, label: 'Kanban Board' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/resumes', icon: FileText, label: 'Resume Manager' },
];

const aiItems = [
  { to: '/ai/resume-analyzer', label: 'Resume Analyzer' },
  { to: '/ai/job-match', label: 'Job Match Score' },
  { to: '/ai/cover-letter', label: 'Cover Letter' },
  { to: '/ai/interview-prep', label: 'Interview Prep' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAIActive = location.pathname.startsWith('/ai');

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700/50 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">CareerFlow</span>
              <span className="block text-xs text-blue-600 font-medium">AI</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">AI Tools</p>
            <div className={`rounded-xl overflow-hidden ${isAIActive ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
              <div className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-default ${isAIActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                <Brain size={18} />
                <span>AI Assistant</span>
              </div>
              {aiItems.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-9 pr-3 py-2 text-sm rounded-lg transition-all ${isActive ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`
                  }>
                  <ChevronRight size={14} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/settings" onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Shield size={18} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20">
              <LogOut size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
