import { useQuery } from '@tanstack/react-query';
import { Briefcase, Users, TrendingUp, Activity, Plus, ArrowRight, Brain, Mail, Video, Search, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { PageLoader } from '../../components/ui/Loading';
import { timeAgo } from '../../lib/utils';

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data.data),
  });

  if (isLoading) return <PageLoader />;

  const stats = data?.stats || {};
  const recent = data?.recentApplications || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here's your recruitment command center.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/sourcing" className="btn-ghost text-sm"><Search size={15} /> AI Search</Link>
          <Link to="/jobs/new" className="btn-primary text-sm"><Plus size={15} /> Post job</Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: stats.activeJobs || 0, sub: `${stats.totalJobs || 0} total`, icon: Briefcase, accent: '#7C3AED' },
          { label: 'Total Candidates', value: stats.totalCandidates || 0, sub: 'in your database', icon: Users, accent: '#A855F7' },
          { label: 'Applications', value: stats.totalApplications || 0, sub: 'this month', icon: Activity, accent: '#10B981' },
          { label: 'Time to Hire', value: '18d', sub: '↓ 22% vs last month', icon: Clock, accent: '#F59E0B' },
        ].map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}15` }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline overview + recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Pipeline Overview</h2>
              <Link to="/jobs" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">All jobs <ArrowRight size={14} /></Link>
            </div>
            <div className="space-y-3">
              {[
                { stage: 'Sourced', count: 142, max: 142, color: '#C084FC' },
                { stage: 'Screening', count: 68, max: 142, color: '#A855F7' },
                { stage: 'Interview', count: 34, max: 142, color: '#7C3AED' },
                { stage: 'Offer', count: 12, max: 142, color: '#6D28D9' },
                { stage: 'Hired', count: 5, max: 142, color: '#10B981' },
              ].map(s => (
                <div key={s.stage} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">{s.stage}</span>
                  <div className="flex-1">
                    <MiniBar value={s.count} max={s.max} color={s.color} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-10 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent applications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Applications</h2>
              <Link to="/talent" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">View all <ArrowRight size={14} /></Link>
            </div>
            <div className="space-y-1">
              {recent.length === 0 && <p className="text-gray-400 text-sm py-6 text-center">No applications yet. <Link to="/jobs/new" className="text-brand-600">Post your first job</Link> to get started.</p>}
              {recent.map((app: { id: string; candidate: { name: string; currentTitle?: string }; job: { title: string }; stage: { name: string; stageType: string }; appliedAt: string; aiScore?: number }) => (
                <div key={app.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-brand-100 text-brand-700">
                    {app.candidate.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{app.candidate.name}</div>
                    <div className="text-xs text-gray-400 truncate">{app.candidate.currentTitle || app.job.title}</div>
                  </div>
                  <div className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 font-medium flex-shrink-0">
                    {app.stage.name}
                  </div>
                  {app.aiScore && (
                    <div className="text-xs font-semibold text-brand-600 flex-shrink-0">{app.aiScore}%</div>
                  )}
                  <div className="text-xs text-gray-400 flex-shrink-0">{timeAgo(app.appliedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/sourcing', icon: Brain, label: 'AI Sourcing Agent', desc: 'Find candidates with AI', color: 'text-purple-600 bg-purple-50' },
                { to: '/outreach', icon: Mail, label: 'Launch Campaign', desc: 'Email or WhatsApp outreach', color: 'text-blue-600 bg-blue-50' },
                { to: '/interviews', icon: Video, label: 'Schedule Interview', desc: 'AI-powered screening', color: 'text-green-600 bg-green-50' },
                { to: '/talent', icon: Search, label: 'Search Talent', desc: 'Browse candidate database', color: 'text-orange-600 bg-orange-50' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.color}`}>
                    <a.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">{a.label}</div>
                    <div className="text-xs text-gray-400">{a.desc}</div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-brand-200" />
              <h2 className="font-semibold">AI Insights</h2>
            </div>
            <div className="space-y-3">
              {[
                { text: 'Pipeline velocity is 12% above industry average', icon: TrendingUp },
                { text: '3 candidates are ready for final interview', icon: CheckCircle2 },
                { text: 'Senior React roles are 40% harder to fill this quarter', icon: AlertCircle },
              ].map(({ text, icon: Icon }) => (
                <div key={text} className="flex items-start gap-2.5 bg-white/10 rounded-lg p-3">
                  <Icon size={14} className="text-brand-200 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-brand-100 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring velocity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">This Month</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sourced', value: '142', color: 'text-purple-600' },
                { label: 'Interviews', value: '34', color: 'text-blue-600' },
                { label: 'Offers', value: '12', color: 'text-green-600' },
                { label: 'Hires', value: '5', color: 'text-brand-600' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
