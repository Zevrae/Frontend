import React, { useEffect, useRef, useState } from 'react';
import { Mail, Lock, User, Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from './hooks/UseAuth';
import { authApi } from './api/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
import { Button } from './components/ui/button';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, loginWithGoogle, register, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleGoogleCredential = async (response: { credential: string }) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);
    try {
      await loginWithGoogle(response.credential);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 150);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          width: 336,
          text: 'continue_with',
        });
        setGoogleReady(true);
      }
    };
    tryInit();
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setFormData({ name: '', phone: '', email: '', password: '' });
      setForgotEmail('');
      setMode('signIn');
    }
  }, [isOpen]);

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      if (mode === 'signIn') {
        await login({ email: formData.email, password: formData.password });
        onClose();
      } else {
        await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        });
        setSuccessMessage(
          'Registration successful. Please check your email to verify your account before logging in.'
        );
        setFormData({ name: '', phone: '', email: '', password: '' });
        setTimeout(() => {
          setSuccessMessage('');
          setMode('signIn');
        }, 4000);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setSuccessMessage(
        'Password reset link sent! Please check your email inbox (and spam folder).'
      );
      setForgotEmail('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || authLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[500px] p-8 md:p-10 border border-[rgba(var(--theme-accent-rgb),0.35)] bg-[rgba(var(--theme-bg-rgb),0.98)] text-[var(--theme-text)] shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl rounded-sm z-[100] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="text-center mb-6">
          <p className="text-xs font-plex-mono font-light tracking-[0.4em] text-[var(--theme-accent)] mb-3 uppercase">
            ZEVRAE
          </p>

          {mode === 'forgotPassword' ? (
            <div>
              <button
                type="button"
                onClick={() => { setMode('signIn'); setErrorMessage(''); setSuccessMessage(''); }}
                className="flex items-center gap-2 text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] transition-colors mb-3 mx-auto font-plex-mono text-[11px] tracking-wider cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </button>
              <DialogTitle className="text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase text-[var(--theme-text)] text-center">
                RESET PASSWORD
              </DialogTitle>
              <DialogDescription className="text-[12px] font-plex-mono tracking-[0.05em] text-[rgba(var(--theme-text-rgb),0.5)] mt-2 text-center">
                Enter your email and we'll send you a reset link
              </DialogDescription>
            </div>
          ) : (
            <div>
              <div className="flex justify-center items-center gap-6 mb-2">
                <button
                  type="button"
                  onClick={() => setMode('signIn')}
                  className={`text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase transition-colors cursor-pointer ${
                    mode === 'signIn'
                      ? 'text-[var(--theme-text)]'
                      : 'text-[rgba(var(--theme-text-rgb),0.35)] hover:text-[rgba(var(--theme-text-rgb),0.7)]'
                  }`}
                >
                  SIGN IN
                </button>
                <span className="text-[rgba(var(--theme-accent-rgb),0.4)] text-2xl font-light">|</span>
                <button
                  type="button"
                  onClick={() => setMode('signUp')}
                  className={`text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase transition-colors cursor-pointer ${
                    mode === 'signUp'
                      ? 'text-[var(--theme-text)]'
                      : 'text-[rgba(var(--theme-text-rgb),0.35)] hover:text-[rgba(var(--theme-text-rgb),0.7)]'
                  }`}
                >
                  SIGN UP
                </button>
              </div>
              <DialogDescription className="text-[12px] font-plex-mono tracking-[0.05em] text-[rgba(var(--theme-text-rgb),0.5)] mt-2 text-center">
                {mode === 'signIn' ? 'Access your personal account' : 'Create your personal account'}
              </DialogDescription>
            </div>
          )}
        </DialogHeader>

        {/* Success message */}
        {successMessage && (
          <div className="flex items-start gap-3 mb-5 p-4 border border-[rgba(var(--theme-accent-rgb),0.3)] rounded-xs bg-[rgba(var(--theme-accent-rgb),0.06)]">
            <CheckCircle size={16} className="text-[var(--theme-accent)] mt-[2px] shrink-0" />
            <p className="text-[11px] font-plex-mono text-[var(--theme-text)] leading-relaxed tracking-wide">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-3 mb-5 p-4 border border-red-500/30 rounded-xs bg-red-500/10">
            <AlertCircle size={16} className="text-red-400 mt-[2px] shrink-0" />
            <p className="text-[11px] font-plex-mono text-red-300 leading-relaxed tracking-wide">
              {errorMessage}
            </p>
          </div>
        )}

        {mode !== 'forgotPassword' ? (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === 'signUp' && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xs py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xs py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xs py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xs py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
              />
            </div>

            {mode === 'signIn' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setMode('forgotPassword'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-[var(--theme-accent)] text-[11px] font-plex-mono hover:underline tracking-wider cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              className="w-full h-12 mt-2"
            >
              {isLoading
                ? 'PROCESSING...'
                : mode === 'signIn'
                ? 'SIGN IN'
                : 'CREATE ACCOUNT'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-accent)]/50" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xs py-3 px-12 text-[var(--theme-text)] text-[13px] font-plex-mono focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder:text-[rgba(var(--theme-text-rgb),0.3)] disabled:opacity-50"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              className="w-full h-12 mt-2"
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </Button>
          </form>
        )}

        {/* Divider + Google Sign-In */}
        {mode !== 'forgotPassword' && (
          <>
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(var(--theme-accent-rgb),0.2)]"></div>
              </div>
              <span className="relative bg-[var(--theme-bg)] px-4 text-[10px] font-plex-mono tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.4)] uppercase">
                Or Continue With
              </span>
            </div>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <div ref={googleBtnRef} className="w-full flex justify-center" />
                {!googleReady && (
                  <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.3)] tracking-wider">Loading Google Sign-In…</p>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled
                title="Google sign-in is not configured"
                className="w-full py-3.5 px-6 bg-transparent border border-[rgba(var(--theme-accent-rgb),0.2)] text-[rgba(var(--theme-text-rgb),0.3)] text-[12px] tracking-[0.1em] font-plex-mono cursor-not-allowed flex items-center justify-center gap-4 rounded-xs"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                <span>GOOGLE — NOT CONFIGURED</span>
              </button>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] font-plex-mono uppercase tracking-[0.1em] text-[rgba(var(--theme-text-rgb),0.35)]">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}