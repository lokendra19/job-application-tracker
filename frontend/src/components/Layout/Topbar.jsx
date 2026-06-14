import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

export default function Topbar({ onMenuClick, title }) {
  const { dark, toggle } = useTheme();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700/50 flex items-center px-4 gap-4 sticky top-0 z-20">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400">
        <Menu size={20} />
      </button>

      <h1 className="flex-1 font-semibold text-gray-900 dark:text-white text-lg hidden sm:block">{title}</h1>

      <div className="flex items-center gap-2 ml-auto">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 card shadow-xl z-50 animate-slide-up">
              <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Notifications</h3>
              <div className="space-y-2">
                <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell size={14} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Interview Reminder</p>
                    <p className="text-xs text-gray-500">You have an interview tomorrow at 10 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
