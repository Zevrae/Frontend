import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authApi } from '../api/auth';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        const msg =
          (response as any)?.data?.message ||
          'Your email has been verified successfully!';
        setMessage(msg);
        setStatus('success');
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Verification failed. The link may be expired or invalid.';
        setMessage(msg);
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] flex items-center justify-center p-6 font-sans">
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
        className="w-full max-w-[480px] bg-[#12100C] border border-[#C5A059]/40 rounded-[16px] shadow-[0_0_60px_rgba(212,175,55,0.08)] p-10 text-center"
      >
        <p className="text-[11px] font-plex-mono font-light tracking-[0.5em] text-[#C5A059] mb-10 uppercase">
          ZEVRAE
        </p>

        {/* Loading */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={36} className="text-[#C5A059]/60" strokeWidth={1} />
            </motion.div>
            <p className="text-[13px] font-plex-mono text-[#EAE6E1]/50 tracking-wider">
              Verifying your email...
            </p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full border border-[#C5A059]/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-[#C5A059]" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-xl font-archivo font-bold tracking-[0.15em] text-[#EAE6E1] uppercase mb-3">
                Email Verified
              </h2>
              <p className="text-[12px] font-plex-mono text-[#EAE6E1]/50 leading-relaxed tracking-wide">
                {message}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="mt-2 w-full py-4 bg-[#C5A059] text-[#12100C] text-[12px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[#d4af37] transition-all duration-300 rounded-sm"
            >
              SIGN IN TO YOUR ACCOUNT
            </motion.button>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-400" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-xl font-archivo font-bold tracking-[0.15em] text-[#EAE6E1] uppercase mb-3">
                Verification Failed
              </h2>
              <p className="text-[12px] font-plex-mono text-red-400/80 leading-relaxed tracking-wide">
                {message}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="mt-2 w-full py-4 bg-transparent border border-[#C5A059]/40 hover:border-[#C5A059] text-[#EAE6E1] text-[12px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[#C5A059]/5 transition-all duration-300 rounded-sm"
            >
              RETURN TO HOME
            </motion.button>
          </motion.div>
        )}

        <p className="mt-10 text-[10px] font-plex-mono uppercase tracking-[0.1em] text-[#EAE6E1]/20">
          ZEVRAE — Luxury is a Matter of Choice
        </p>
      </motion.div>
    </div>
  );
}
