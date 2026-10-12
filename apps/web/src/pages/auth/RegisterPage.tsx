import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Building2, User } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'RECRUITER' | 'CANDIDATE'>('RECRUITER');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await login(form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Zap size={24} className="text-brand-500" />
          <span className="text-white font-bold text-xl">SearchKraft</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
        <p className="text-slate-400 mb-6">Get started for free.</p>

        {/* Role toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-navy-800 rounded-xl">
          {(['RECRUITER', 'CANDIDATE'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {r === 'RECRUITER' ? <Building2 size={15} /> : <User size={15} />}
              {r === 'RECRUITER' ? 'Recruiter / Agency' : 'Job Seeker'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} required placeholder="Jane Smith" />
          </div>
          <div className="form-group">
            <label className="label">Work email</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} required placeholder="jane@company.com" />
          </div>
          {role === 'RECRUITER' && (
            <div className="form-group">
              <label className="label">Agency / Company name</label>
              <input className="input" value={form.organizationName} onChange={set('organizationName')} placeholder="Acme Recruitment" />
            </div>
          )}
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
