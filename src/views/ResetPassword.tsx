import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match. Please try again.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      if (!token) throw new Error('Invalid reset link.');
      await authApi.resetPassword(token, password);
      setStatus('success');
      setMessage('Your password has been reset successfully. You can now sign in with your new password.');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Reset failed. The link may be expired or invalid. Please request a new one.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex items-center justify-center p-6 font-sans">
      {/* Film grain */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[480px] bg-[var(--theme-bg)] border border-[rgba(var(--theme-accent-rgb),0.4)] rounded-[16px] shadow-[0_0_60px_rgba(212,175,55,0.08)] p-10"
      >
        <p className="text-[11px] font-plex-mono font-light tracking-[0.5em] text-[var(--theme-accent)] mb-10 uppercase text-center">
          ZEVRAE
        </p>

        <AnimatePresence mode="wait">
          {/* Success */}
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <div className="w-16 h-16 rounded-full border border-[rgba(var(--theme-accent-rgb),0.3)] flex items-center justify-center">
                <CheckCircle size={32} className="text-[var(--theme-accent)]" strokeWidth={1} />
              </div>
              <div>
                <h2 className="text-xl font-archivo font-bold tracking-[0.15em] text-[var(--theme-text)] uppercase mb-3">
                  Password Reset
                </h2>
                <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] leading-relaxed tracking-wide">
                  {message}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="mt-2 w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[12px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-sm"
              >
                SIGN IN TO YOUR ACCOUNT
              </motion.button>
            </motion.div>
          )}

          {/* Form (idle / loading / error) */}
          {status !== 'success' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-archivo font-bold tracking-[0.15em] text-[var(--theme-text)] uppercase mb-3">
                  Reset Password
                </h2>
                <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] leading-relaxed tracking-wide">
                  Enter your new password below
                </p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 mb-5 p-4 border border-red-500/30 rounded-sm bg-red-500/5"
                  >
                    <AlertCircle size={16} className="text-red-400 mt-[2px] shrink-0" />
                    <p className="text-[11px] font-plex-mono text-red-400/90 leading-relaxed tracking-wide">
                      {message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-sm py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)]/60 transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-sm py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)]/60 transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-2 w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[12px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'UPDATING...' : 'SET NEW PASSWORD'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.35)] hover:text-[var(--theme-accent)] transition-colors tracking-wider"
                >
                  Back to Home
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-[10px] font-plex-mono uppercase tracking-[0.1em] text-[rgba(var(--theme-text-rgb),0.2)] text-center">
          ZEVRAE — Luxury is a Matter of Choice
        </p>
      </motion.div>
    </div>
  );
}
