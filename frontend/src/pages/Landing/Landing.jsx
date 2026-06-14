import { Link } from 'react-router-dom';
import { Zap, Briefcase, Brain, BarChart3, Kanban, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Application Tracker', desc: 'Track every job application with detailed status, notes, and recruiter info.' },
  { icon: Kanban, title: 'Kanban Board', desc: 'Visualize your pipeline with drag-and-drop Kanban across all stages.' },
  { icon: Brain, title: 'AI Tools Suite', desc: 'Resume analyzer, job match score, cover letter generator & interview prep.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Charts, trends, insights and AI-powered suggestions on your job search.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, encrypted data, rate limiting and input validation.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Modern React frontend with instant updates and smooth animations.' },
];

const stats = [
  { value: '7+', label: 'Status Stages' },
  { value: '4', label: 'AI Tools' },
  { value: '100%', label: 'Free' },
  { value: '∞', label: 'Applications' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold">CareerFlow <span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-8">
          <Brain size={14} />
          <span>AI-Powered Job Application Tracker</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          Land your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">dream job</span><br />smarter & faster
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Track applications, analyze resumes, generate cover letters, and prepare for interviews — all powered by Claude AI.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
            Start Tracking Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-8 py-3 rounded-lg text-base transition-all">
            Sign In
          </Link>
        </div>
      </section>

      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Icon size={22} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your job search?</h2>
          <p className="text-gray-400 mb-8">Join thousands of job seekers using CareerFlow AI to land their dream roles faster.</p>
          <Link to="/register" className="btn-primary flex items-center gap-2 px-10 py-3 text-base mx-auto w-fit">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
            {['No credit card required', 'Free forever', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-gray-500 border-t border-white/5">
        <p>© 2024 CareerFlow AI. Built with React, Flask & Claude AI.</p>
      </footer>
    </div>
  );
}
