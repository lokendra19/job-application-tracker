import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../services/api';
import { User, Lock, Sun, Moon, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { dark, toggle } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) return toast.error('New passwords do not match');
    setSavingPass(true);
    try {
      await authAPI.changePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      toast.success('Password changed');
      setPasswords({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); } finally { setSavingPass(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profile.name} onChange={e => setProfile({ name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Lock size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            { id: 'current_password', label: 'Current Password' },
            { id: 'new_password', label: 'New Password' },
            { id: 'confirm', label: 'Confirm New Password' },
          ].map(({ id, label }) => (
            <div key={id}>
              <label className="label">{label}</label>
              <input type="password" className="input" value={passwords[id]}
                onChange={e => setPasswords(p => ({ ...p, [id]: e.target.value }))} placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {savingPass ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
              {dark ? <Moon size={18} className="text-amber-600 dark:text-amber-400" /> : <Sun size={18} className="text-amber-600 dark:text-amber-400" />}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Theme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dark ? 'Dark mode' : 'Light mode'} is active</p>
            </div>
          </div>
          <button onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
