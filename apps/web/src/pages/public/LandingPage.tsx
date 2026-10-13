import { Link } from 'react-router-dom';
import { Brain, Target, TrendingUp, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmlp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmlp)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <LogoMark size={32} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-gray-900 tracking-tight" style={{ fontSize: 18 }}>
              Search<span className="gradient-text">Kraft</span>
            </span>
            <span className="text-gray-400 text-xs tracking-widest uppercase font-medium">Recruit OS</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm px-4 py-1.5 rounded-full mb-6 border border-brand-200">
          <Zap size={14} /> AI-native recruitment platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Crafting right<br />
          <span className="gradient-text">connections</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
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
            <div key={lbl} className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{val}</div>
              <div className="text-sm text-gray-500">{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything you need to hire at scale</h2>
        <p className="text-gray-500 text-center mb-12">Built for modern recruitment agencies and corporate teams.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-brand-300 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-700" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your recruitment?</h2>
          <p className="text-brand-200 mb-8">Join agencies that have cut their time-to-hire by 60%.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base bg-white text-brand-700 hover:bg-brand-50 transition-colors shadow-lg">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={22} />
            <span className="text-gray-400 text-sm">© 2024 SearchKraft</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
