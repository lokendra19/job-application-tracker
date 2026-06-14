import { useEffect, useState } from 'react';
import { resumesAPI } from '../../services/api';
import { Upload, Trash2, CheckCircle, FileText, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetch = () => {
    resumesAPI.getAll()
      .then(({ data }) => setResumes(data.resumes))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) return toast.error('Only PDF files are supported');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', file.name.replace('.pdf', ''));
    setUploading(true);
    try {
      await resumesAPI.upload(formData);
      toast.success('Resume uploaded!');
      fetch();
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try {
      await resumesAPI.delete(deleteId);
      toast.success('Resume deleted');
      setDeleteId(null);
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const handleActivate = async (id) => {
    try {
      await resumesAPI.activate(id);
      toast.success('Active resume updated');
      fetch();
    } catch { toast.error('Failed to set active'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upload Resume</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Store and manage multiple resume versions. PDF files only.</p>
        <label className={`inline-flex items-center gap-2 btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Uploading...</span></>
          ) : (
            <><Upload size={16} /><span>Upload PDF</span></>
          )}
          <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="space-y-3">
        {resumes.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={48} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No resumes uploaded</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first resume to get started</p>
          </div>
        ) : resumes.map(resume => (
          <div key={resume.id} className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white truncate">{resume.name}</p>
                {resume.is_active && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Uploaded {new Date(resume.created_at).toLocaleDateString()}
                {resume.ats_score != null && <span className="ml-2">· ATS: <strong className="text-blue-600 dark:text-blue-400">{resume.ats_score}/100</strong></span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!resume.is_active && (
                <button onClick={() => handleActivate(resume.id)}
                  className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-600 transition-colors" title="Set as active">
                  <Star size={16} />
                </button>
              )}
              <a href={resume.file_url} target="_blank" rel="noreferrer"
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-600 transition-colors" title="Download">
                <FileText size={16} />
              </a>
              <button onClick={() => setDeleteId(resume.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Resume" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this resume?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
