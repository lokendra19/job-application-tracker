import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoverLetter() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    company_name: '', job_role: '', experience: '', skills: '', user_name: user?.name || '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.company_name || !form.job_role) return toast.error('Company name and job role are required');
    setLoading(true);
    setResult('');
    try {
      const { data } = await aiAPI.generateCoverLetter({ ...form, user_name: user?.name || form.user_name });
      setResult(data.cover_letter);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${form.company_name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Cover Letter Generator</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Generate a personalized, professional cover letter in seconds.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name *</label>
            <input className="input" value={form.company_name} onChange={set('company_name')} placeholder="Google" />
          </div>
          <div>
            <label className="label">Job Role *</label>
            <input className="input" value={form.job_role} onChange={set('job_role')} placeholder="Senior Software Engineer" />
          </div>
          <div>
            <label className="label">Experience</label>
            <input className="input" value={form.experience} onChange={set('experience')} placeholder="5 years in full-stack development" />
          </div>
          <div>
            <label className="label">Key Skills</label>
            <input className="input" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, Python, AWS" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Generating...</span></>
          ) : (
            <><FileText size={16} /><span>Generate Cover Letter</span></>
          )}
        </button>
      </div>

      {result && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Generated Cover Letter</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2 text-sm">
                <Copy size={14} /> Copy
              </button>
              <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm">
                <Download size={14} /> Download
              </button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-serif">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
