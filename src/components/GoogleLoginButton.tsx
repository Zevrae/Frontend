'use client';

import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/UseAuth';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  theme?: 'filled_black' | 'outline' | 'filled_blue';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  width?: string | number;
  className?: string;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  theme = 'filled_black',
  size = 'large',
  shape = 'rectangular',
  text = 'continue_with',
  width = '336',
  className = '',
}: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const { credential } = credentialResponse;
      if (!credential) {
        throw new Error('No credential received from Google.');
      }

      await loginWithGoogle(credential);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Google sign-in failed. Please try again.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    const msg = 'Google authentication popup was closed or cancelled.';
    setErrorMessage(msg);
    if (onError) onError(msg);
  };

  return (
    <div className={`google-auth-container flex flex-col items-center justify-center w-full ${className}`}>
      {loading && (
        <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] tracking-wider mb-2">
          Signing in with Google…
        </p>
      )}

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
        theme={theme}
        size={size}
        shape={shape}
        text={text}
        width={width}
      />

      {errorMessage && (
        <p className="mt-2 text-[11px] font-plex-mono text-red-500 tracking-wide text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
