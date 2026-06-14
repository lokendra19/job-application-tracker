import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Calendar, TrendingUp, Award, Target, ArrowRight, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { PageLoader } from '../../components/UI/LoadingSpinner';

const PIE_COLORS = ['#8b5cf6','#3b82f6','#f59e0b','#6366f1','#06b6d4','#22c55e','#ef4444'];

const statCards = (data) => [
  { label: 'Total Applications', value: data.total_applications, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', change: '+12%' },
  { label: 'Interviews Scheduled', value: data.interviews_scheduled, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', change: '+5' },
  { label: 'Offers Received', value: data.offers, icon: Award, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10', change: '+2' },
  { label: 'Success Rate', value: `${data.success_rate}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', change: 'Excellent' },
];

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getInsightsText(),
    ]).then(([ov, ins]) => {
      setOverview(ov.data);
      setInsights(ins.data.insights || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pieData = Object.entries(overview?.status_distribution || {})
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your job search overview</p>
        </div>
        <Link to="/applications" className="btn-primary flex items-center gap-2 hidden sm:flex">
          <span>Add Application</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(overview || {}).map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Monthly Applications
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overview?.monthly_applications || []}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No applications yet
            </div>
          )}
        </div>
      </div>

      {insights.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            AI Insights
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <span className="text-amber-500 text-lg">💡</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/kanban', icon: '🗂️', title: 'Kanban Board', desc: 'Drag & drop applications' },
          { to: '/ai/resume-analyzer', icon: '🤖', title: 'AI Resume Analyzer', desc: 'Get your ATS score' },
          { to: '/ai/interview-prep', icon: '💬', title: 'Interview Prep', desc: 'Practice with AI questions' },
        ].map(({ to, icon, title, desc }) => (
          <Link key={to} to={to} className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
