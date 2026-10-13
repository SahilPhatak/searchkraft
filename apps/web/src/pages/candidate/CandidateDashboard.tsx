import { useAuth } from '../../lib/AuthContext';
import { Zap, Briefcase, Bell, User } from 'lucide-react';

export default function CandidateDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-brand-500" />
            <span className="font-bold text-xl text-white">SearchKraft</span>
          </div>
          <button onClick={logout} className="btn-ghost text-sm">Sign out</button>
        </div>

        <div className="page-header mb-6">
          <div>
            <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="page-subtitle">Your job applications and matches</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[['Active Applications', '3', Briefcase], ['New Matches', '12', Zap], ['Notifications', '2', Bell]].map(([label, val, Icon]) => (
            <div key={label as string} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-dark-400 uppercase tracking-wide">{label}</span>
                <Icon size={18} className="text-brand-400" />
              </div>
              <div className="text-3xl font-bold text-white">{val}</div>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3">Your profile</h2>
          <div className="text-sm text-dark-400">Complete your profile to improve your match score and get found by top recruiters.</div>
          <button className="btn-primary btn-sm mt-3"><User size={14} /> Edit profile</button>
        </div>
      </div>
    </div>
  );
}
