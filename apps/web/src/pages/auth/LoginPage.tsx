import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => { setEmail('admin@demo.searchkraft.com'); setPassword('demo123456'); };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-navy-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl">SearchKraft</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Your AI-native recruitment OS</h1>
          <p className="text-brand-200 text-lg">Find, match, and hire the best candidates 10x faster with intelligent automation.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['10x', 'Faster hiring'], ['95%', 'Match accuracy'], ['40%', 'Cost reduction']].map(([val, lbl]) => (
              <div key={lbl} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-brand-200 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-navy-900">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap size={24} className="text-brand-500" />
            <span className="text-white font-bold text-xl">SearchKraft</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-slate-400 mb-8">Welcome back — pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" placeholder="you@company.com" />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-3 w-full text-center text-sm text-brand-400 hover:text-brand-300">
            Use demo credentials
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            No account? <Link to="/register" className="text-brand-400 hover:text-brand-300">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
