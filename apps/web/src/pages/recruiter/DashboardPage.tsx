import { useQuery } from '@tanstack/react-query';
import { Briefcase, Users, TrendingUp, Activity, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { PageLoader } from '../../components/ui/Loading';
import { timeAgo, getStatusBadge } from '../../lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data.data),
  });

  if (isLoading) return <PageLoader />;

  const stats = data?.stats || {};
  const recent = data?.recentApplications || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your recruitment pipeline.</p>
        </div>
        <Link to="/jobs/new" className="btn-primary"><Plus size={16} /> New job</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: stats.activeJobs || 0, total: stats.totalJobs, icon: Briefcase, color: '#C084FC' },
          { label: 'Candidates', value: stats.totalCandidates || 0, icon: Users, color: '#A855F7' },
          { label: 'Applications', value: stats.totalApplications || 0, icon: Activity, color: '#10B981' },
          { label: 'Pipeline Health', value: '87%', icon: TrendingUp, color: '#F59E0B' },
        ].map(({ label, value, icon: Icon, color, total }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-dark-400 font-medium uppercase tracking-wide">{label}</span>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
            {total !== undefined && <div className="text-xs text-dark-500 mt-1">{total} total</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <Link to="/jobs" className="text-sm flex items-center gap-1 hover:text-brand-300 transition-colors" style={{ color: '#C084FC' }}>View all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-dark-400 text-sm py-4 text-center">No applications yet</p>}
            {recent.map((app: { id: string; candidate: { name: string; currentTitle?: string }; job: { title: string }; stage: { name: string }; appliedAt: string }) => (
              <div key={app.id} className="flex items-center gap-3 py-2 border-b border-dark-700 last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(124,58,237,0.2)', color: '#C084FC' }}>
                  {app.candidate.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{app.candidate.name}</div>
                  <div className="text-xs text-dark-400 truncate">{app.job.title} · {app.stage.name}</div>
                </div>
                <div className="text-xs text-dark-500 flex-shrink-0">{timeAgo(app.appliedAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">AI Insights</h2>
          <div className="space-y-3">
            {[
              { text: 'Pipeline velocity is 12% above industry average', type: 'green' },
              { text: '3 candidates ready for final interview', type: 'blue' },
              { text: 'Senior React roles are 40% harder to fill this month', type: 'yellow' },
            ].map(({ text, type }) => (
              <div key={text} className={`badge-${type} p-3 rounded-lg text-xs leading-relaxed`} style={{ display: 'block' }}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
