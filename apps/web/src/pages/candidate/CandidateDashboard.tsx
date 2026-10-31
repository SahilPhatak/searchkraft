import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import {
  Search, Briefcase, Bell, User, CheckCircle2, Clock, ArrowRight,
  FileText, Star, MapPin, Building2, Eye, ChevronRight, LogOut,
  Zap, TrendingUp, Loader2, AlertCircle, X
} from 'lucide-react';

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

interface Job {
  id: string;
  title: string;
  description: string;
  workMode: string;
  experienceLevel: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  skills: string[];
  department: string | null;
  createdAt: string;
  hasApplied: boolean;
  organization: { name: string; logoUrl: string | null };
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    workMode: string;
    organization: { name: string; logoUrl: string | null };
  };
  stage: { name: string; stageType: string; color: string | null };
}

interface CandidateProfile {
  user: { id: string; name: string; email: string; avatarUrl: string | null; phone: string | null; title: string | null } | null;
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    currentTitle: string | null;
    currentCompany: string | null;
    experienceYears: number | null;
    skills: string[];
    summary: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    availabilityStatus: string;
    expectedSalary: number | null;
    noticePeriodDays: number | null;
    resumeUrl: string | null;
  } | null;
}

interface Stats {
  activeApplications: number;
  interviews: number;
  totalJobs: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function stageColor(stageType: string): string {
  switch (stageType) {
    case 'APPLIED': return 'text-blue-600 bg-blue-50';
    case 'SCREENING': return 'text-yellow-600 bg-yellow-50';
    case 'INTERVIEW': return 'text-purple-600 bg-purple-50';
    case 'OFFER': return 'text-green-600 bg-green-50';
    case 'HIRED': return 'text-emerald-700 bg-emerald-50';
    case 'REJECTED': return 'text-red-600 bg-red-50';
    case 'WITHDRAWN': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'applications' | 'profile'>('matches');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ activeApplications: 0, interviews: 0, totalJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchJobs = useCallback(async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');
      const { data } = await api.get(`/candidate-portal/jobs?${params}`);
      setJobs(data.data || []);
    } catch {
      setJobs([]);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await api.get('/candidate-portal/applications');
      setApplications(data.data || []);
    } catch {
      setApplications([]);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/candidate-portal/profile');
      setProfile(data.data);
    } catch {
      setProfile(null);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/candidate-portal/stats');
      setStats(data.data);
    } catch {
      // keep defaults
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchJobs(), fetchApplications(), fetchProfile(), fetchStats()])
      .finally(() => setLoading(false));
  }, [fetchJobs, fetchApplications, fetchProfile, fetchStats]);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await api.post(`/candidate-portal/jobs/${jobId}/apply`);
      showToast('Application submitted successfully!', 'success');
      // Update local state
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, hasApplied: true } : j));
      setStats(prev => ({ ...prev, activeApplications: prev.activeApplications + 1 }));
      fetchApplications();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to apply';
      showToast(msg, 'error');
    } finally {
      setApplying(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchQuery);
  };

  const handleProfileUpdate = async (updates: Record<string, unknown>) => {
    try {
      await api.put('/candidate-portal/profile', updates);
      showToast('Profile updated!', 'success');
      fetchProfile();
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

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
            {([
              { key: 'matches' as const, label: 'Job Matches', icon: Search },
              { key: 'applications' as const, label: 'My Applications', icon: Briefcase },
              { key: 'profile' as const, label: 'Profile', icon: User },
            ]).map(tab => (
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
              {stats.activeApplications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
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
              <p className="text-brand-200">
                {stats.totalJobs > 0 ? (
                  <>You have <span className="text-white font-semibold">{stats.totalJobs} active jobs</span> to explore and <span className="text-white font-semibold">{stats.activeApplications} active application{stats.activeApplications !== 1 ? 's' : ''}</span>.</>
                ) : (
                  <>Start exploring job opportunities that match your skills.</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('matches')} className="bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-50 transition-colors flex items-center gap-2">
                <Search size={15} /> Browse jobs
              </button>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, skill, or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button type="submit" className="btn-primary px-6">Search</button>
            </form>

            {/* AI match explanation */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Browse active jobs</span> — Explore all available positions and apply directly. Your applications are tracked in the "My Applications" tab.
                </p>
              </div>
            </div>

            {/* Job cards */}
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Briefcase size={40} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs available yet</h3>
                <p className="text-sm text-gray-500">Check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md hover:shadow-brand-50 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-brand-700 transition-colors">{job.title}</h3>
                          {job.hasApplied && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 flex-shrink-0">
                              <CheckCircle2 size={13} /> Applied
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="font-medium text-gray-700">{job.organization.name}</span>
                          {job.location && (
                            <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{job.workMode}</span>
                          <span className="text-gray-400">{timeAgo(job.createdAt)}</span>
                        </div>
                        {job.skills.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {job.skills.slice(0, 5).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="text-xs text-gray-400">+{job.skills.length - 5} more</span>
                            )}
                          </div>
                        )}
                        {job.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        {job.salaryMin && job.salaryMax ? (
                          <span>{job.currency} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}</span>
                        ) : job.experienceLevel ? (
                          <span className="capitalize">{job.experienceLevel.toLowerCase()} level</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        {!job.hasApplied ? (
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={applying === job.id}
                            className="btn-primary text-sm disabled:opacity-50"
                          >
                            {applying === job.id ? (
                              <><Loader2 size={14} className="animate-spin" /> Applying...</>
                            ) : (
                              <>Apply now <ArrowRight size={14} /></>
                            )}
                          </button>
                        ) : (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={14} /> Applied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Application stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active', value: stats.activeApplications.toString(), icon: Briefcase, color: 'text-brand-600 bg-brand-50' },
                { label: 'Interviews', value: stats.interviews.toString(), icon: Clock, color: 'text-green-600 bg-green-50' },
                { label: 'Total Jobs', value: stats.totalJobs.toString(), icon: Eye, color: 'text-blue-600 bg-blue-50' },
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
              {applications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Briefcase size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No applications yet. Browse jobs and apply!</p>
                  <button onClick={() => setActiveTab('matches')} className="btn-primary btn-sm mt-4">
                    <Search size={14} /> Browse jobs
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {applications.map(app => (
                    <div key={app.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                        <Building2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-gray-900">{app.job.title}</h4>
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.job.organization.name} · Applied {timeAgo(app.appliedAt)}
                          {app.job.location && <> · {app.job.location}</>}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${stageColor(app.stage.stageType)}`}>
                        {app.stage.name}
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
}

// ─── Profile Tab Component ──────────────────────────
function ProfileTab({ profile, onUpdate }: { profile: CandidateProfile | null; onUpdate: (data: Record<string, unknown>) => Promise<void> }) {
  const p = profile?.profile;
  const u = profile?.user;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: p?.name || u?.name || '',
    phone: p?.phone || u?.phone || '',
    location: p?.location || '',
    currentTitle: p?.currentTitle || '',
    currentCompany: p?.currentCompany || '',
    experienceYears: p?.experienceYears?.toString() || '',
    skills: p?.skills?.join(', ') || '',
    summary: p?.summary || '',
    linkedinUrl: p?.linkedinUrl || '',
    portfolioUrl: p?.portfolioUrl || '',
    availabilityStatus: p?.availabilityStatus || 'OPEN',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    await onUpdate({
      name: form.name,
      phone: form.phone || undefined,
      location: form.location || undefined,
      currentTitle: form.currentTitle || undefined,
      currentCompany: form.currentCompany || undefined,
      experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
      skills,
      summary: form.summary || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
      portfolioUrl: form.portfolioUrl || undefined,
      availabilityStatus: form.availabilityStatus,
    });
    setSaving(false);
    setEditing(false);
  };

  const completionItems = [
    { label: 'Basic info', done: !!(p?.name && p?.location) },
    { label: 'Work experience', done: !!(p?.currentTitle && p?.experienceYears) },
    { label: 'Skills', done: (p?.skills?.length || 0) > 0 },
    { label: 'Summary', done: !!p?.summary },
    { label: 'LinkedIn / Portfolio', done: !!(p?.linkedinUrl || p?.portfolioUrl) },
    { label: 'Availability set', done: !!p?.availabilityStatus },
  ];
  const completedSteps = completionItems.filter(s => s.done).length;
  const completionPct = Math.round((completedSteps / completionItems.length) * 100);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
              {(p?.name || u?.name)?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{p?.name || u?.name || 'Your Name'}</h2>
              <p className="text-gray-500">{u?.email}</p>
              {p?.currentTitle && <p className="text-sm text-gray-600">{p.currentTitle}{p.currentCompany ? ` at ${p.currentCompany}` : ''}</p>}
            </div>
            <button onClick={() => setEditing(!editing)} className="ml-auto btn-ghost text-sm">
              <User size={14} /> {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Current Title</label>
                  <input value={form.currentTitle} onChange={e => setForm({ ...form, currentTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Current Company</label>
                  <input value={form.currentCompany} onChange={e => setForm({ ...form, currentCompany: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Years of Experience</label>
                  <input type="number" value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Skills (comma-separated)</label>
                <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="React, TypeScript, Node.js" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Summary</label>
                <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Brief summary about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">LinkedIn URL</label>
                  <input value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Portfolio URL</label>
                  <input value={form.portfolioUrl} onChange={e => setForm({ ...form, portfolioUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Availability</label>
                <select value={form.availabilityStatus} onChange={e => setForm({ ...form, availabilityStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="ACTIVELY_LOOKING">Actively Looking</option>
                  <option value="OPEN">Open to Opportunities</option>
                  <option value="NOT_LOOKING">Not Looking</option>
                  <option value="EMPLOYED">Employed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save profile'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Current role', value: p?.currentTitle || 'Not set' },
                { label: 'Experience', value: p?.experienceYears ? `${p.experienceYears} years` : 'Not set' },
                { label: 'Location', value: p?.location || 'Not set' },
                { label: 'Availability', value: p?.availabilityStatus?.replace(/_/g, ' ') || 'Open' },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                  <div className="text-sm font-medium text-gray-900 capitalize">{f.value.toLowerCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        {!editing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(p?.skills || []).length > 0 ? (
                p!.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm rounded-full font-medium">{skill}</span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet. Edit your profile to add skills.</p>
              )}
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 text-sm rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors">+ Add skill</button>
            </div>
          </div>
        )}

        {/* Resume */}
        {!editing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Resume</h3>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{p?.resumeUrl ? 'Resume uploaded' : 'No resume uploaded yet'}</p>
              <p className="text-xs text-gray-400 mt-1">Resume upload feature coming soon</p>
            </div>
          </div>
        )}
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
            {completionItems.map(step => (
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
          <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            {[
              { label: 'Active applications', value: profile ? '—' : '0', icon: Briefcase },
              { label: 'Available jobs', value: '—', icon: Search },
              { label: 'Profile completion', value: `${completionPct}%`, icon: TrendingUp },
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
  );
}
