import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { MessageSquare, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: 'technical', label: 'Technical', emoji: '💻', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  { key: 'hr', label: 'HR', emoji: '👤', color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' },
  { key: 'behavioral', label: 'Behavioral', emoji: '🧠', color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' },
];

function QuestionCard({ q, i, category }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-slate-700/50 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 w-5">Q{i + 1}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{q.question}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 dark:border-slate-700/30">
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Suggested Answer</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPrep() {
  const [form, setForm] = useState({ job_role: '', experience_level: 'Mid-level', company: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('technical');

  const handleGenerate = async () => {
    if (!form.job_role) return toast.error('Job role is required');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await aiAPI.interviewPrep(form);
      setResult(data);
      toast.success('Questions generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Interview Preparation</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get personalized interview questions with suggested answers for your role.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Job Role *</label>
            <input className="input" value={form.job_role} onChange={set('job_role')} placeholder="Software Engineer" />
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select className="input" value={form.experience_level} onChange={set('experience_level')}>
              {['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Manager'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input className="input" value={form.company} onChange={set('company')} placeholder="Google, Amazon..." />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Generating Questions...</span></>
          ) : (
            <><Brain size={16} /><span>Generate Interview Questions</span></>
          )}
        </button>
      </div>

      {result && (
        <div className="card animate-slide-up">
          <div className="flex gap-2 mb-6">
            {CATEGORIES.map(({ key, label, emoji, color }) => {
              const count = result[key]?.length || 0;
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === key ? color : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                  <span>{emoji}</span>
                  <span>{label}</span>
                  <span className="bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            {(result[activeTab] || []).map((q, i) => (
              <QuestionCard key={i} q={q} i={i} category={activeTab} />
            ))}
            {!result[activeTab]?.length && (
              <p className="text-gray-400 text-sm text-center py-8">No questions in this category</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
