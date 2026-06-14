import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { PageLoader } from '../../components/UI/LoadingSpinner';
import { Shield, Users, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getUsers(), adminAPI.getStats()])
      .then(([u, s]) => { setUsers(u.data.users); setStats(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id) => {
    try {
      await adminAPI.deactivateUser(id);
      toast.success('User deactivated');
      setUsers(u => u.filter(x => x.id !== id));
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_users || 0}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={18} className="text-blue-600" /> Users
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/2">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">{u.role}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeactivate(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors" title="Deactivate">
                      <UserX size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
