import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data.data),
  });

  if (isLoading) return <PageLoader />;
  const stats = data?.stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Recruitment performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Total Jobs', stats.totalJobs || 0],
          ['Active Jobs', stats.activeJobs || 0],
          ['Candidates', stats.totalCandidates || 0],
          ['Applications', stats.totalApplications || 0],
        ].map(([label, value]) => (
          <div key={label as string} className="stat-card text-center">
            <div className="text-3xl font-bold text-brand-400">{value}</div>
            <div className="text-sm text-dark-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-brand-400" />Pipeline Overview</h2>
        <div className="text-dark-400 text-sm">
          Connect a job to view detailed funnel analytics.
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-400" />Key Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          {[['Time to hire', '18 days'], ['Offer acceptance', '87%'], ['Source quality', 'LinkedIn 42%']].map(([k, v]) => (
            <div key={k} className="bg-dark-700 rounded-xl p-4">
              <div className="text-sm text-dark-400 mb-1">{k}</div>
              <div className="text-lg font-bold text-white">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
