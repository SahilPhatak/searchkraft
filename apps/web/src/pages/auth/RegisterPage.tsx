import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import { Building2, User } from 'lucide-react';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmreg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmreg)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'RECRUITER' | 'CANDIDATE'>('RECRUITER');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <LogoMark size={36} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-gray-900 tracking-tight" style={{ fontSize: 20 }}>
              Search<span className="gradient-text">Kraft</span>
            </span>
            <span className="text-gray-400 text-xs tracking-widest uppercase font-medium">AI Recruiting</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-gray-500 mb-6">Get started for free.</p>

        {/* Role toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          {(['RECRUITER', 'CANDIDATE'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                role === r ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={role === r ? { background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)' } : {}}
            >
              {r === 'RECRUITER' ? <Building2 size={15} /> : <User size={15} />}
              {r === 'RECRUITER' ? 'Recruiter / Agency' : 'Job Seeker'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} required placeholder="Jane Smith" />
          </div>
          <div>
            <label className="label">Work email</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} required placeholder="jane@company.com" />
          </div>
          {role === 'RECRUITER' && (
            <div>
              <label className="label">Agency / Company name</label>
              <input className="input" value={form.organizationName} onChange={set('organizationName')} placeholder="Acme Recruitment" />
            </div>
          )}
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
