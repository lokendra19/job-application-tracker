import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { Target, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobMatch() {
  const [form, setForm] = useState({ resume_text: '', job_description: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!form.resume_text || !form.job_description) return toast.error('Both fields are required');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await aiAPI.jobMatch(form);
      setResult(data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 50;
  const scoreColor = (s) => s >= 80 ? 'stroke-green-500' : s >= 60 ? 'stroke-amber-500' : 'stroke-red-500';
  const textColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Job Match Score</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Paste your resume and a job description to get a compatibility score with skill gap analysis.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Your Resume (text)</label>
            <textarea className="input resize-none" rows={10} value={form.resume_text}
              onChange={e => setForm(f => ({ ...f, resume_text: e.target.value }))}
              placeholder="Paste your resume text here..." />
          </div>
          <div>
            <label className="label">Job Description</label>
            <textarea className="input resize-none" rows={10} value={form.job_description}
              onChange={e => setForm(f => ({ ...f, job_description: e.target.value }))}
              placeholder="Paste the job description here..." />
          </div>
        </div>
        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Analyzing...</span></>
          ) : (
            <><Target size={16} /><span>Calculate Match Score</span></>
          )}
        </button>
      </div>

      {result && (
        <div className="grid sm:grid-cols-2 gap-6 animate-slide-up">
          <div className="card flex flex-col items-center sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Match Score</h3>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (result.match_percentage / 100) * circumference}
                  strokeLinecap="round" className={`transition-all duration-1000 ${scoreColor(result.match_percentage)}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${textColor(result.match_percentage)}`}>{result.match_percentage}%</span>
                <span className="text-xs text-gray-500">Match</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{result.summary}</p>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Matching Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matching_skills?.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <XCircle size={18} className="text-red-500" />
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div className="card sm:col-span-2">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-blue-500 font-bold">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
