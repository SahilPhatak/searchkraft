import { Link } from 'react-router-dom';
import { Search, Brain, Mail, Video, Database, Shield, Users, Zap, ArrowRight, CheckCircle2, ChevronRight, Phone, MessageSquare } from 'lucide-react';

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
  {
    icon: Database,
    title: 'Candidate Database',
    desc: 'Search profiles by skills, experience, location and employer. Build a living talent pool that grows with every interaction.',
    tag: 'Core'
  },
  {
    icon: Brain,
    title: 'AI Sourcing',
    desc: 'Find relevant candidates using natural-language queries. Our AI searches across your database and surfaces matches you would have missed.',
    tag: 'AI-Powered'
  },
  {
    icon: Phone,
    title: 'Candidate Outreach',
    desc: 'Access permitted contact details and reach candidates directly. Multi-channel sequences across email, WhatsApp, and phone.',
    tag: 'Engagement'
  },
  {
    icon: Video,
    title: 'AI Interviews',
    desc: 'Run first-round screening interviews with AI. Live coding for engineers, behavioral assessments, and structured evaluations.',
    tag: 'Screening'
  },
  {
    icon: Search,
    title: 'Smart Search',
    desc: 'Type naturally — "senior React dev in Mumbai open to hybrid" — and get ranked results with match scores and hiring signals.',
    tag: 'Discovery'
  },
  {
    icon: Users,
    title: 'Built for Recruiters',
    desc: 'Designed for agencies, executive search firms and in-house TA teams. Multi-tenant support with client-specific pipelines.',
    tag: 'Teams'
  },
];

const stats = [
  { value: '10x', label: 'Faster sourcing' },
  { value: '85%', label: 'Match accuracy' },
  { value: '60%', label: 'Less time-to-hire' },
  { value: '3x', label: 'More placements' },
];

const integrations = [
  'Greenhouse', 'Lever', 'Ashby', 'Workday', 'Bullhorn',
  'SmartRecruiters', 'Gmail', 'Outlook', 'Slack', 'LinkedIn',
];

const steps = [
  { step: '01', title: 'Describe the role', desc: 'Tell our AI who you\'re looking for in plain language. Paste a JD or type a natural description.' },
  { step: '02', title: 'AI maps the market', desc: 'Our sourcing agents search across your talent pool, calibrate to your preferences, and rank candidates by fit.' },
  { step: '03', title: 'Review & engage', desc: 'Review AI-scored profiles, shortlist the best, and launch personalized outreach sequences — all from one place.' },
  { step: '04', title: 'Interview & hire', desc: 'Schedule AI-powered first-round interviews, get structured assessments, and move top candidates through your pipeline.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <LogoMark size={32} />
            <span className="font-bold text-gray-900 tracking-tight text-lg">
              Search<span className="gradient-text">Kraft</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it works</a>
            <a href="#integrations" className="hover:text-brand-600 transition-colors">Integrations</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-white pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center px-6 md:px-8 pt-20 md:pt-28 pb-16">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm px-4 py-1.5 rounded-full mb-8 border border-brand-200">
            <Zap size={14} /> Your Talent. One Intelligent Search.
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            The AI platform for<br />
            <span className="gradient-text">end-to-end hiring</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            An AI-powered candidate database for recruitment agencies and corporate hiring teams.
            Source, screen, engage, and hire — all in one place.
          </p>

          {/* Search prompt */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl px-5 py-4 shadow-lg shadow-brand-100/30 hover:border-brand-300 transition-colors">
              <Search className="text-brand-400 mr-3 flex-shrink-0" size={22} />
              <span className="text-gray-400 text-left text-sm md:text-base">Tell me who you're looking for and I'll find the best matches...</span>
              <Link to="/register" className="ml-auto flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Try free
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-brand-600 text-sm font-semibold mb-4 uppercase tracking-wider">
            <Brain size={16} /> Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to hire smarter
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            From sourcing to offer, SearchKraft covers every step of your recruitment workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group bg-white rounded-2xl border border-gray-200 p-7 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-50 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
                  <f.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{f.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-brand-600 text-sm font-semibold mb-4 uppercase tracking-wider">
              <Zap size={16} /> How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hire in four steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              From role description to signed offer — AI handles the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-gray-200 p-7 flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Works with your stack
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Connect with 40+ ATS, CRM, and communication tools you already use.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {integrations.map((name) => (
            <div key={name} className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-colors">
              {name}
            </div>
          ))}
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 text-sm font-medium text-brand-700">
            + 30 more
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-green-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise-grade security</h3>
              <p className="text-gray-500">
                SOC 2 Type II certified. AES-256 encryption at rest, TLS 1.3 in transit. Role-based access controls,
                audit logging, and GDPR/CCPA-ready data workflows. Your data stays yours.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {['SOC 2', 'GDPR', 'SSO'].map(badge => (
                <span key={badge} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start hiring smarter today
          </h2>
          <p className="text-brand-200 mb-8 text-lg max-w-xl mx-auto">
            Join thousands of recruiters who use SearchKraft to find, engage, and hire the best talent. Set up in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors inline-flex items-center justify-center gap-2">
              Get started free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
              See features
            </a>
          </div>
          <p className="text-brand-300 text-sm mt-6">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LogoMark size={24} />
                <span className="font-bold text-gray-900">Search<span className="gradient-text">Kraft</span></span>
              </div>
              <p className="text-gray-500 text-sm">Your Talent. One Intelligent Search.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Product</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <a href="#features" className="block hover:text-brand-600">AI Sourcing</a>
                <a href="#features" className="block hover:text-brand-600">Outreach</a>
                <a href="#features" className="block hover:text-brand-600">AI Interviews</a>
                <a href="#integrations" className="block hover:text-brand-600">Integrations</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Company</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <a href="#" className="block hover:text-brand-600">About</a>
                <a href="#" className="block hover:text-brand-600">Blog</a>
                <a href="#" className="block hover:text-brand-600">Careers</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <a href="#" className="block hover:text-brand-600">Privacy</a>
                <a href="#" className="block hover:text-brand-600">Terms</a>
                <a href="#" className="block hover:text-brand-600">Security</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SearchKraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
