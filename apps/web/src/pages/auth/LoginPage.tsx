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
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #0f0f0f 100%)' }}>
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <LogoMark size={40} />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white tracking-tight" style={{ fontSize: 22 }}>
                Search<span style={{ background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Kraft</span>
              </span>
              <span className="text-xs tracking-widest uppercase font-medium" style={{ color: '#C084FC' }}>Recruit OS</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Your AI-native recruitment OS</h1>
          <p className="text-lg" style={{ color: '#D8B4FE' }}>Find, match, and hire the best candidates 10x faster with intelligent automation.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['10x', 'Faster hiring'], ['95%', 'Match accuracy'], ['40%', 'Cost reduction']].map(([val, lbl]) => (
              <div key={lbl} className="rounded-xl p-4" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs mt-1" style={{ color: '#C084FC' }}>{lbl}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm font-medium tracking-widest uppercase" style={{ color: 'rgba(192,132,252,0.6)' }}>Crafting Right Connections</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <LogoMark size={32} />
            <span className="text-white font-bold text-xl">Search<span style={{ background: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Kraft</span></span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-dark-400 mb-8">Welcome back — pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" placeholder="you@company.com" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-dark-400 hover:text-dark-200">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-3 w-full text-center text-sm hover:text-brand-300 transition-colors" style={{ color: '#C084FC' }}>
            Use demo credentials
          </button>

          <p className="mt-6 text-center text-sm text-dark-400">
            No account? <Link to="/register" className="hover:text-brand-300 transition-colors" style={{ color: '#C084FC' }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
