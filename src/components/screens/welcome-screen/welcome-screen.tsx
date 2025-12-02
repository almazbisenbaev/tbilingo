'use client';

import "./welcome-screen.css";

import { useState } from 'react';
import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton/GoogleSignInButton';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({ onSignUp, onSignIn }: WelcomeScreenProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      // No need to call onClose - the AuthWrapper will automatically switch when user is authenticated
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please enable pop-ups for this site');
      } else {
        setError('Failed to sign in with Google. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="welcome">
      <div className="welcome-inner">

        <div className='flex justify-center'>
          <Image src="/images/logo.svg" alt="Tbilingo" width={120} height={48} className='object-contain' />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="welcome-actions">
          <GoogleSignInButton 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </GoogleSignInButton>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            onClick={onSignUp}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            Sign Up with Email
          </button>
          <button 
            onClick={onSignIn}
            disabled={loading}
            className="btn btn-block"
          >
            Sign In with Email
          </button>
        </div>

      </div>
    </div>
  );
}