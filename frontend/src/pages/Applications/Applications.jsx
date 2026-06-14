import { useEffect, useState, useCallback } from 'react';
import { applicationsAPI } from '../../services/api';
import { Plus, Search, Filter, Download, Upload, Pencil, Trash2, ExternalLink, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/UI/Modal';
import StatusBadge from '../../components/UI/StatusBadge';
import ApplicationForm from './ApplicationForm';
import { STATUSES, JOB_TYPES } from '../../utils/statusColors';
import { PageLoader } from '../../components/UI/LoadingSpinner';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchApps = useCallback(() => {
    setLoading(true);
    applicationsAPI.getAll({ search, status: statusFilter })
      .then(({ data }) => setApps(data.applications))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDelete = async () => {
    try {
      await applicationsAPI.delete(deleteId);
      toast.success('Application deleted');
      setDeleteId(null);
      fetchApps();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExportCSV = async () => {
    try {
      const { data } = await applicationsAPI.exportCSV();
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'applications.csv'; a.click();
    } catch { toast.error('Export failed'); }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await applicationsAPI.importCSV(formData);
      toast.success(data.message);
      fetchApps();
    } catch { toast.error('Import failed'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search company, title, location..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} /> Export
          </button>
          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} /> Import
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </label>
          <button onClick={() => { setEditApp(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700/50">
                  {['Company', 'Role', 'Location', 'Status', 'Date', 'Type', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {apps.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-lg font-medium">No applications yet</p>
                    <p className="text-sm mt-1">Click "Add" to track your first application</p>
                  </td></tr>
                ) : apps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{app.company_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{app.job_title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{app.location || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {app.application_date ? new Date(app.application_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{app.job_type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {app.job_url && (
                          <a href={app.job_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-blue-600 transition-colors">
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button onClick={() => { setEditApp(app); setShowModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteId(app.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {apps.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700/50 text-sm text-gray-500 dark:text-gray-400">
              {apps.length} application{apps.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editApp ? 'Edit Application' : 'Add Application'} size="lg">
        <ApplicationForm
          initial={editApp}
          onSuccess={() => { setShowModal(false); fetchApps(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Application" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this application?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
