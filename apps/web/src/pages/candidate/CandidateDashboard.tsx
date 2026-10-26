import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Search, Briefcase, Bell, User, CheckCircle2, Clock, ArrowRight, FileText, Star, MapPin, Building2, Eye, ExternalLink, ChevronRight, LogOut, Zap, TrendingUp, BookOpen } from 'lucide-react';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmcd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmcd)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  matchScore: number;
  postedAgo: string;
  tags: string[];
}

interface MockApplication {
  id: string;
  jobTitle: string;
  company: string;
  stage: string;
  stageColor: string;
  appliedAgo: string;
  hasUpdate: boolean;
}

const mockJobs: MockJob[] = [
  { id: '1', title: 'Senior React Developer', company: 'TechVentures Inc', location: 'Mumbai', workMode: 'Hybrid', matchScore: 94, postedAgo: '2d ago', tags: ['React', 'TypeScript', 'Next.js'] },
  { id: '2', title: 'Full Stack Engineer', company: 'DataDriven Corp', location: 'Bangalore', workMode: 'Remote', matchScore: 87, postedAgo: '4d ago', tags: ['Node.js', 'React', 'PostgreSQL'] },
  { id: '3', title: 'Frontend Lead', company: 'DesignFirst Studio', location: 'Pune', workMode: 'Onsite', matchScore: 82, postedAgo: '1w ago', tags: ['React', 'Design Systems', 'Team Lead'] },
];

const mockApplications: MockApplication[] = [
  { id: '1', jobTitle: 'Senior React Developer', company: 'TechVentures Inc', stage: 'Interview', stageColor: 'text-purple-600 bg-purple-50', appliedAgo: '5d ago', hasUpdate: true },
  { id: '2', jobTitle: 'Product Engineer', company: 'StartupXYZ', stage: 'Screening', stageColor: 'text-blue-600 bg-blue-50', appliedAgo: '1w ago', hasUpdate: false },
  { id: '3', jobTitle: 'UI Engineer', company: 'CreativeAgency', stage: 'Applied', stageColor: 'text-gray-600 bg-gray-100', appliedAgo: '2w ago', hasUpdate: false },
];

const profileCompletion = [
  { label: 'Basic info', done: true },
  { label: 'Work experience', done: true },
  { label: 'Skills', done: true },
  { label: 'Resume uploaded', done: false },
  { label: 'Portfolio / GitHub', done: false },
  { label: 'Availability set', done: true },
];

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'applications' | 'profile'>('matches');

  const completedSteps = profileCompletion.filter(s => s.done).length;
  const completionPct = Math.round((completedSteps / profileCompletion.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-gray-900 tracking-tight">
              Search<span className="gradient-text">Kraft</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: 'matches' as const, label: 'Job Matches', icon: Search },
              { key: 'applications' as const, label: 'My Applications', icon: Briefcase },
              { key: 'profile' as const, label: 'Profile', icon: User },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
              <p className="text-brand-200">You have <span className="text-white font-semibold">3 new job matches</span> and <span className="text-white font-semibold">1 application update</span> today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('matches')} className="bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-50 transition-colors flex items-center gap-2">
                <Search size={15} /> Browse matches
              </button>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* AI match explanation */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">AI-powered matches</span> — We analyze your skills, experience, and preferences to surface roles that fit you best. Scores update as you interact.
                </p>
              </div>
            </div>

            {/* Job cards */}
            <div className="space-y-4">
              {mockJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md hover:shadow-brand-50 transition-all group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">{job.title}</h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0 ${
                          job.matchScore >= 90 ? 'bg-green-50 text-green-700' : job.matchScore >= 80 ? 'bg-brand-50 text-brand-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          <Star size={13} />
                          {job.matchScore}% match
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="font-medium text-gray-700">{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{job.workMode}</span>
                        <span className="text-gray-400">{job.postedAgo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                      <Eye size={14} /> View details
                    </button>
                    <button className="btn-primary text-sm">
                      Apply now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Application stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active', value: '3', icon: Briefcase, color: 'text-brand-600 bg-brand-50' },
                { label: 'Interviews', value: '1', icon: Clock, color: 'text-green-600 bg-green-50' },
                { label: 'Profile Views', value: '28', icon: Eye, color: 'text-blue-600 bg-blue-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{s.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                      <s.icon size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Application list */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Your Applications</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {mockApplications.map(app => (
                  <div key={app.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-gray-900">{app.jobTitle}</h4>
                        {app.hasUpdate && (
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{app.company} · Applied {app.appliedAgo}</div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${app.stageColor}`}>
                      {app.stage}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Interview prep */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <BookOpen size={16} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Interview Prep</h3>
                  <p className="text-sm text-gray-500">You have an interview scheduled for <span className="font-medium text-gray-700">Senior React Developer at TechVentures</span></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Practice coding', desc: 'React & TypeScript challenges' },
                  { label: 'Review company', desc: 'TechVentures overview & culture' },
                  { label: 'Mock interview', desc: 'AI-powered practice session' },
                ].map(item => (
                  <button key={item.label} className="text-left p-4 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 transition-colors group">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-brand-700">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                  </div>
                  <button className="ml-auto btn-ghost text-sm"><User size={14} /> Edit profile</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Current role', value: 'Software Engineer' },
                    { label: 'Experience', value: '5 years' },
                    { label: 'Location', value: 'Mumbai, India' },
                    { label: 'Availability', value: 'Open to opportunities' },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                      <div className="text-sm font-medium text-gray-900">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Docker', 'AWS', 'Git'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm rounded-full font-medium">{skill}</span>
                  ))}
                  <button className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 text-sm rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors">+ Add skill</button>
                </div>
              </div>

              {/* Resume */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Resume</h3>
                  <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">Upload new</button>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No resume uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload your resume to improve your match score and get found by recruiters</p>
                  <button className="btn-primary btn-sm mt-4"><FileText size={14} /> Upload resume</button>
                </div>
              </div>
            </div>

            {/* Completion sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Profile Strength</h3>
                  <span className={`text-sm font-bold ${completionPct >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{completionPct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${completionPct}%`,
                      background: completionPct >= 80 ? '#10B981' : '#F59E0B',
                    }}
                  />
                </div>
                <div className="space-y-2.5">
                  {profileCompletion.map(step => (
                    <div key={step.label} className="flex items-center gap-2.5">
                      {step.done ? (
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${step.done ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Your Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Profile views this week', value: '28', icon: Eye },
                    { label: 'Search appearances', value: '156', icon: Search },
                    { label: 'Recruiter interest', value: '12', icon: TrendingUp },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <s.icon size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-500 flex-1">{s.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
