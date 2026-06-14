import { useEffect, useState } from 'react';
import { interviewsAPI } from '../../services/api';
import { Plus, Trash2, Pencil, Calendar, Clock, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/UI/Modal';
import { PageLoader } from '../../components/UI/LoadingSpinner';

function InterviewForm({ initial, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    company: initial?.company || '', job_title: initial?.job_title || '',
    date: initial?.date || '', time: initial?.time || '',
    type: initial?.type || 'Video', meeting_link: initial?.meeting_link || '',
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.date) return toast.error('Company and date are required');
    setLoading(true);
    try {
      if (initial) await interviewsAPI.update(initial.id, form);
      else await interviewsAPI.create(form);
      toast.success(initial ? 'Interview updated' : 'Interview scheduled');
      onSuccess();
    } catch { toast.error('Failed to save'); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Company *</label><input className="input" value={form.company} onChange={set('company')} placeholder="Google" required /></div>
        <div><label className="label">Job Title</label><input className="input" value={form.job_title} onChange={set('job_title')} placeholder="Software Engineer" /></div>
        <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={set('date')} required /></div>
        <div><label className="label">Time</label><input type="time" className="input" value={form.time} onChange={set('time')} /></div>
        <div>
          <label className="label">Interview Type</label>
          <select className="input" value={form.type} onChange={set('type')}>
            {['Video', 'Phone', 'On-site', 'Technical', 'HR'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Meeting Link</label><input className="input" value={form.meeting_link} onChange={set('meeting_link')} placeholder="https://meet.google.com/..." /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Interview notes..." /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : initial ? 'Update' : 'Schedule'}</button>
      </div>
    </form>
  );
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editInterview, setEditInterview] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = () => {
    interviewsAPI.getAll().then(({ data }) => setInterviews(data.interviews)).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    try {
      await interviewsAPI.delete(deleteId);
      toast.success('Interview deleted');
      setDeleteId(null);
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const upcoming = interviews.filter(i => i.date && i.date >= new Date().toISOString().split('T')[0]);
  const past = interviews.filter(i => i.date && i.date < new Date().toISOString().split('T')[0]);

  if (loading) return <PageLoader />;

  const InterviewCard = ({ interview }) => (
    <div className="card flex items-start gap-4">
      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{interview.company}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{interview.job_title}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => { setEditInterview(interview); setShowModal(true); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-blue-600 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => setDeleteId(interview.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={12} /> {interview.date}
          </span>
          {interview.time && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} /> {interview.time}
          </span>}
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Video size={12} /> {interview.type}
          </span>
          {interview.meeting_link && (
            <a href={interview.meeting_link} target="_blank" rel="noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Join Meeting</a>
          )}
        </div>
        {interview.notes && <p className="text-xs text-gray-400 mt-2 italic">{interview.notes}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div />
        <button onClick={() => { setEditInterview(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming ({upcoming.length})</h3>
          <div className="space-y-3">{upcoming.map(i => <InterviewCard key={i.id} interview={i} />)}</div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-3">Past ({past.length})</h3>
          <div className="space-y-3 opacity-60">{past.map(i => <InterviewCard key={i.id} interview={i} />)}</div>
        </div>
      )}

      {interviews.length === 0 && (
        <div className="card text-center py-16">
          <Calendar size={48} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No interviews scheduled</p>
          <p className="text-sm text-gray-400 mt-1">Click "Schedule Interview" to add one</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editInterview ? 'Edit Interview' : 'Schedule Interview'} size="lg">
        <InterviewForm initial={editInterview} onSuccess={() => { setShowModal(false); fetch(); }} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Interview" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this interview?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
