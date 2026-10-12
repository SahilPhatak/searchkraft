import { useAuth } from '../../lib/AuthContext';
import { Zap, Briefcase, Users, CheckCircle2 } from 'lucide-react';

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-brand-500" />
            <span className="font-bold text-xl text-white">SearchKraft</span>
          </div>
          <button onClick={logout} className="btn-ghost text-sm">Sign out</button>
        </div>

        <div className="page-header mb-6">
          <div>
            <h1 className="page-title">Client Portal</h1>
            <p className="page-subtitle">Welcome, {user?.name} — track your open roles and candidates</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[['Open Roles', '5', Briefcase], ['Shortlisted', '18', Users], ['Offers Sent', '2', CheckCircle2]].map(([label, val, Icon]) => (
            <div key={label as string} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
                <Icon size={18} className="text-brand-400" />
              </div>
              <div className="text-3xl font-bold text-white">{val}</div>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3">Recent updates from your recruiter</h2>
          <div className="text-sm text-slate-400">Your recruitment partner will share candidate shortlists and updates here.</div>
        </div>
      </div>
    </div>
  );
}
