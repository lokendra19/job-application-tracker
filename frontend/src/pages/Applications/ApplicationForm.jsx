import { useState } from 'react';
import { applicationsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { STATUSES, JOB_TYPES, PRIORITIES } from '../../utils/statusColors';

export default function ApplicationForm({ initial, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    company_name: initial?.company_name || '',
    job_title: initial?.job_title || '',
    location: initial?.location || '',
    salary: initial?.salary || '',
    job_type: initial?.job_type || 'Full-time',
    job_url: initial?.job_url || '',
    application_date: initial?.application_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: initial?.status || 'Applied',
    notes: initial?.notes || '',
    resume_used: initial?.resume_used || '',
    recruiter_name: initial?.recruiter_name || '',
    recruiter_email: initial?.recruiter_email || '',
    priority: initial?.priority || 'Medium',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.job_title) return toast.error('Company and job title are required');
    setLoading(true);
    try {
      if (initial) {
        await applicationsAPI.update(initial.id, form);
        toast.success('Application updated');
      } else {
        await applicationsAPI.create(form);
        toast.success('Application added');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Company Name *">
          <input className="input" value={form.company_name} onChange={set('company_name')} placeholder="Google" required />
        </Field>
        <Field label="Job Title *">
          <input className="input" value={form.job_title} onChange={set('job_title')} placeholder="Software Engineer" required />
        </Field>
        <Field label="Location">
          <input className="input" value={form.location} onChange={set('location')} placeholder="San Francisco, CA" />
        </Field>
        <Field label="Salary">
          <input className="input" value={form.salary} onChange={set('salary')} placeholder="$120,000" />
        </Field>
        <Field label="Job Type">
          <select className="input" value={form.job_type} onChange={set('job_type')}>
            {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Application Date">
          <input type="date" className="input" value={form.application_date} onChange={set('application_date')} />
        </Field>
        <Field label="Priority">
          <select className="input" value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Job URL">
        <input className="input" value={form.job_url} onChange={set('job_url')} placeholder="https://..." />
      </Field>
      <Field label="Resume Used">
        <input className="input" value={form.resume_used} onChange={set('resume_used')} placeholder="Resume v3.pdf" />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Recruiter Name">
          <input className="input" value={form.recruiter_name} onChange={set('recruiter_name')} placeholder="Jane Smith" />
        </Field>
        <Field label="Recruiter Email">
          <input className="input" type="email" value={form.recruiter_email} onChange={set('recruiter_email')} placeholder="jane@company.com" />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Any notes about the application..." />
      </Field>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : initial ? 'Update' : 'Add Application'}
        </button>
      </div>
    </form>
  );
}
