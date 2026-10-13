import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmlogin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmlogin)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
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
      {/* Left panel — purple brand side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 text-white"
           style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}>
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.3"/>
                <polygon points="4,16 26,6 15,18" fill="white"/>
                <polygon points="15,18 20,16 17,24" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white tracking-tight" style={{ fontSize: 20 }}>SearchKraft</span>
              <span className="text-xs tracking-widest uppercase font-medium text-purple-200">Recruit OS</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Your AI-native recruitment OS</h1>
          <p className="text-lg text-purple-200">Find, match, and hire the best candidates 10x faster with intelligent automation.</p>
          <p className="mt-4 text-sm font-semibold tracking-widest uppercase text-purple-300">Crafting Right Connections</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['10x', 'Faster hiring'], ['95%', 'Match accuracy'], ['40%', 'Cost reduction']].map(([val, lbl]) => (
              <div key={lbl} className="rounded-xl p-4 bg-white/10 border border-white/20">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs mt-1 text-purple-200">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — white form side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <LogoMark size={32} />
            <span className="font-bold text-gray-900 text-xl">Search<span className="gradient-text">Kraft</span></span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 mb-8">Welcome back — pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" placeholder="you@company.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-3 w-full text-center text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Use demo credentials
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account? <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
