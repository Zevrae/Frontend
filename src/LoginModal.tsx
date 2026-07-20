import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from './hooks/UseAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setFormData({ name: '', phone: '', email: '', password: '' });
      setMode('signIn');
    }
  }, [isOpen]);

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [mode]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const isLoading = submitting || authLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-[500px] bg-[#12100C] border border-[#C5A059]/40 rounded-[16px] shadow-[0_0_40px_rgba(212,175,55,0.1)] p-8 md:p-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[#EAE6E1]/50 hover:text-[#C5A059] transition-colors focus:outline-none z-10"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-sm font-plex-mono font-light tracking-[0.4em] text-[#C5A059] mb-4 uppercase">
                ZEVRAE
              </h1>
              <div className="flex justify-center gap-6 mb-2">
                <button
                  onClick={() => setMode('signIn')}
                  className={`text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase transition-colors ${mode === 'signIn' ? 'text-[#EAE6E1]' : 'text-[#EAE6E1]/40 hover:text-[#EAE6E1]/70'}`}
                >
                  SIGN IN
                </button>
                <span className="text-[#C5A059]/40 text-2xl font-light">|</span>
                <button
                  onClick={() => setMode('signUp')}
                  className={`text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase transition-colors ${mode === 'signUp' ? 'text-[#EAE6E1]' : 'text-[#EAE6E1]/40 hover:text-[#EAE6E1]/70'}`}
                >
                  SIGN UP
                </button>
              </div>
              <p className="text-[12px] font-plex-mono tracking-[0.05em] text-[#EAE6E1]/50 mt-4">
                {mode === 'signIn' ? 'Access your personal account' : 'Create your personal account'}
              </p>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 mb-5 p-4 border border-[#C5A059]/30 rounded-sm bg-[#C5A059]/5"
                >
                  <CheckCircle size={16} className="text-[#C5A059] mt-[2px] shrink-0" />
                  <p className="text-[11px] font-plex-mono text-[#EAE6E1]/80 leading-relaxed tracking-wide">
                    {successMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 mb-5 p-4 border border-red-500/30 rounded-sm bg-red-500/5"
                >
                  <AlertCircle size={16} className="text-red-400 mt-[2px] shrink-0" />
                  <p className="text-[11px] font-plex-mono text-red-400/90 leading-relaxed tracking-wide">
                    {errorMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <AnimatePresence mode="popLayout">
                {mode === 'signUp' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/50" size={18} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-[#1A1814] border border-[#C5A059]/20 rounded-sm py-3 px-12 text-[#EAE6E1] text-[13px] font-plex-mono focus:outline-none focus:border-[#C5A059]/60 transition-colors placeholder:text-[#EAE6E1]/30 disabled:opacity-50"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/50" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Mobile Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-[#1A1814] border border-[#C5A059]/20 rounded-sm py-3 px-12 text-[#EAE6E1] text-[13px] font-plex-mono focus:outline-none focus:border-[#C5A059]/60 transition-colors placeholder:text-[#EAE6E1]/30 disabled:opacity-50"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/50" size={18} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-[#1A1814] border border-[#C5A059]/20 rounded-sm py-3 px-12 text-[#EAE6E1] text-[13px] font-plex-mono focus:outline-none focus:border-[#C5A059]/60 transition-colors placeholder:text-[#EAE6E1]/30 disabled:opacity-50"
                      />
                    </div>
                  </motion.div>
                )}

                {mode === 'signIn' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/50" size={18} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full bg-[#1A1814] border border-[#C5A059]/20 rounded-sm py-3 px-12 text-[#EAE6E1] text-[13px] font-plex-mono focus:outline-none focus:border-[#C5A059]/60 transition-colors placeholder:text-[#EAE6E1]/30 disabled:opacity-50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]/50" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1A1814] border border-[#C5A059]/20 rounded-sm py-3 px-12 text-[#EAE6E1] text-[13px] font-plex-mono focus:outline-none focus:border-[#C5A059]/60 transition-colors placeholder:text-[#EAE6E1]/30 disabled:opacity-50"
                />
              </div>

              {mode === 'signIn' && (
                <div className="flex justify-end">
                  <button type="button" className="text-[#C5A059] text-[11px] font-plex-mono hover:underline tracking-wider">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-[#C5A059] text-[#12100C] text-[12px] font-bold tracking-[0.2em] font-plex-mono hover:bg-[#d4af37] transition-all duration-300 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'PROCESSING...'
                  : mode === 'signIn'
                  ? 'SIGN IN'
                  : 'CREATE ACCOUNT'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C5A059]/20"></div>
              </div>
              <span className="relative bg-[#12100C] px-4 text-[10px] font-plex-mono tracking-[0.2em] text-[#EAE6E1]/40 uppercase">
                Or Continue With
              </span>
            </div>

            {/* Google button – disabled until OAuth is wired up */}
            <button
              type="button"
              disabled
              title="Coming Soon"
              className="w-full py-4 px-6 bg-transparent border border-[#C5A059]/20 text-[#EAE6E1]/30 text-[12px] tracking-[0.1em] font-plex-mono cursor-not-allowed flex items-center justify-center gap-4 rounded-sm"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span>GOOGLE — COMING SOON</span>
            </button>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-plex-mono uppercase tracking-[0.1em] text-[#EAE6E1]/30">
                By continuing you agree to our Terms & Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
