import { useAuth } from '../../lib/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and workspace</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-white">Profile</h2>
        <div className="grid gap-4">
          <div className="form-group">
            <label className="label">Name</label>
            <input className="input" defaultValue={user?.name} readOnly />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" defaultValue={user?.email} readOnly />
          </div>
          <div className="form-group">
            <label className="label">Role</label>
            <input className="input" defaultValue={user?.role} readOnly />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Integrations</h2>
        <div className="space-y-3">
          {[['Anthropic AI', 'AI matching, parsing & insights', true], ['GitHub', 'Code portfolio screening', false], ['LinkedIn', 'Candidate sourcing', false]].map(([name, desc, active]) => (
            <div key={name as string} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
              <div>
                <div className="font-medium text-dark-200">{name}</div>
                <div className="text-xs text-dark-500">{desc}</div>
              </div>
              <span className={active ? 'badge-green' : 'badge-gray'}>{active ? 'Active' : 'Connect'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
