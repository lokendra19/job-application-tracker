import { useState } from 'react';
import { aiAPI } from '../../services/api';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF resume');
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    setResult(null);
    try {
      const { data } = await aiAPI.analyzeResume(formData);
      setResult(data);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const scoreRing = (score) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 36;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Resume Analyzer</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upload your PDF resume to get an ATS score, skills analysis, and improvement suggestions.</p>

        <div
          className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f); }}
          onClick={() => document.getElementById('resume-upload').click()}>
          <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
          <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          {file ? (
            <div>
              <p className="font-medium text-blue-600 dark:text-blue-400">{file.name}</p>
              <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Drop your resume here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">PDF files only, max 16MB</p>
            </div>
          )}
        </div>

        <button onClick={handleUpload} disabled={!file || loading} className="btn-primary mt-4 flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Analyzing...</span></>
          ) : (
            <><Upload size={16} /><span>Analyze Resume</span></>
          )}
        </button>
      </div>

      {result && (
        <div className="grid sm:grid-cols-2 gap-6 animate-slide-up">
          <div className="card flex flex-col items-center text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">ATS Score</h3>
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                <circle cx="40" cy="40" r="36" fill="none" strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (result.ats_score / 100) * circumference}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${scoreRing(result.ats_score)}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor(result.ats_score)}`}>{result.ats_score}</span>
              </div>
            </div>
            <p className={`text-sm font-medium ${scoreColor(result.ats_score)}`}>
              {result.ats_score >= 80 ? 'Excellent' : result.ats_score >= 60 ? 'Good' : 'Needs Work'}
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Skills Found ({result.skills_found?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.skills_found?.map(s => (
                <span key={s} className="px-2.5 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              Missing Skills ({result.missing_skills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills?.map(s => (
                <span key={s} className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-500" />
              Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {result.suggestions?.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-blue-500 font-bold mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
