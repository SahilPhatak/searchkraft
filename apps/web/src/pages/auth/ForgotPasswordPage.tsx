import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmfp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmfp)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: unknown) {
      // Always show success to prevent email enumeration
      setSent(true);
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

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h2>
            <p className="text-gray-500 mb-6">Enter the email you signed up with and we'll send you a reset link.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="you@company.com"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  'Sending…'
                ) : (
                  <><Mail size={16} /> Send reset link</>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-2">
              If an account exists for <span className="font-medium text-gray-700">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Check your spam folder if you don't see it within a few minutes.
            </p>
            <button onClick={() => { setSent(false); setEmail(''); }} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Try a different email
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
