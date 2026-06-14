import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { PageLoader } from '../../components/UI/LoadingSpinner';
import { TrendingUp, Award, Target, BarChart3, Building2, Lightbulb } from 'lucide-react';

const COLORS = ['#8b5cf6','#3b82f6','#f59e0b','#6366f1','#06b6d4','#22c55e','#ef4444'];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getCompanyInsights(),
      analyticsAPI.getInsightsText(),
    ]).then(([ov, co, ins]) => {
      setOverview(ov.data);
      setCompanyData(co.data.top_companies || []);
      setInsights(ins.data.insights || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pieData = Object.entries(overview?.status_distribution || {}).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: 'Total Applications', value: overview?.total_applications || 0, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Interviews', value: overview?.interviews_scheduled || 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Offers', value: overview?.offers || 0, icon: Award, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
    { label: 'Success Rate', value: `${overview?.success_rate || 0}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Applications Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={overview?.monthly_applications || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Application Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            Top Companies Applied
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={companyData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="company" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            AI-Powered Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <span className="text-xl">💡</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
                Add more applications to unlock AI insights
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
