import { Link } from 'react-router-dom';
import { Zap, Brain, Target, TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our AI scores candidates across 7 dimensions—skills, experience, culture fit, and more—so you surface the right people instantly.' },
  { icon: Target, title: 'Smart Sourcing', desc: 'NLP search understands natural language. Type "senior React dev in Mumbai open to hybrid" and get precise results.' },
  { icon: TrendingUp, title: 'Pipeline Analytics', desc: 'Visual kanban boards with conversion metrics. Know exactly where candidates drop and optimize your funnel.' },
  { icon: Users, title: 'Multi-tenant Agency', desc: 'Manage multiple client hiring programs under one roof. Each client gets their own branded portal.' },
  { icon: Zap, title: 'AI JD Parser', desc: 'Paste a job description and our AI extracts skills, requirements, and structure automatically.' },
  { icon: CheckCircle2, title: 'Interview Intelligence', desc: 'Structured evaluations, scorecards, and AI summaries to help your team make consistent decisions.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-navy-700 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap size={22} className="text-brand-500" />
          <span className="font-bold text-xl text-white">SearchKraft</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-brand-600/20 text-brand-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-brand-500/30">
          <Zap size={14} /> AI-native recruitment platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Hire smarter with<br />
          <span className="text-brand-400">AI at every step</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          SearchKraft combines intelligent candidate matching, automated pipelines, and deep analytics into one powerful recruitment OS.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">
            View demo
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {[['10x', 'Faster time-to-hire'], ['95%', 'AI match accuracy'], ['40%', 'Reduced hiring cost']].map(([val, lbl]) => (
            <div key={lbl} className="card p-6 text-center">
              <div className="text-3xl font-bold text-brand-400 mb-1">{val}</div>
              <div className="text-sm text-slate-400">{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Everything you need to hire at scale</h2>
        <p className="text-slate-400 text-center mb-12">Built for modern recruitment agencies and corporate teams.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-brand-500/50 transition-colors">
              <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-800 border-t border-navy-700">
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your recruitment?</h2>
          <p className="text-slate-400 mb-8">Join agencies that have cut their time-to-hire by 60%.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-700 px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="text-slate-400 text-sm">© 2024 SearchKraft</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300">Privacy</a>
            <a href="#" className="hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
