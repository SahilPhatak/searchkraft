import { useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmrp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lmrp)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      let msg = 'Reset failed. The link may have expired.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        if (axiosErr.response?.data?.error) msg = axiosErr.response.data.error;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid reset link</h2>
          <p className="text-gray-500 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
          <Link to="/forgot-password" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            Request new link
          </Link>
          <p className="mt-4">
            <Link to="/login" className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

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

        {!done ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h2>
            <p className="text-gray-500 mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  required
                  className="input"
                  placeholder="At least 8 characters"
                  minLength={8}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  className="input"
                  placeholder="Repeat your password"
                  minLength={8}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  'Resetting…'
                ) : (
                  <><Lock size={16} /> Reset password</>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h2>
            <p className="text-gray-500 mb-6">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              Sign in now
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
