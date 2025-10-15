'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export default function SignupPage({ onSwitchToLogin, onClose }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, loginWithGoogle } = useAuth();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onClose(); // Close the auth form after successful login
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      return setError('Please fill in all required fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName || undefined);
      onClose(); // Close the auth form after successful signup
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password');
      } else {
        setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">

        <div className='flex justify-center'>
            <button 
                type="button" 
                onClick={onClose}
                className="auth-back-button"
            >
                ← Back
            </button>
        </div>

      <div className="auth-header">
        <h2>Join Tbilingo</h2>
        <p>Create your account to start learning Georgian</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <div className="form-group">
          <label htmlFor="displayName">Display Name (Optional)</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary btn-block"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button 
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="btn btn-google btn-block"
      >
        <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="link-button"
          >
            Sign in
          </button>
        </p>
      </div>

      <style jsx>{`
        .auth-form {

        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .auth-form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
        }

        .form-group input:focus {
          outline: none;
          border-color: #F24822;
          background: white;
          box-shadow: 0 0 0 3px rgba(242, 72, 34, 0.1);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e5e7eb;
        }

        .auth-divider span {
          padding: 0 1rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: white;
          color: #1f2937;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-google:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          flex-shrink: 0;
        }

        .auth-switch {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1.5rem;
        }

        .auth-switch p {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .link-button {
          background: none;
          border: none;
          color: #F24822;
          text-decoration: none;
          cursor: pointer;
          font-size: inherit;
          padding: 0;
          transition: color 0.2s ease;
        }

        .link-button:hover {
          color: #AA2608;
          text-decoration: underline;
        }

        .auth-back-button {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.875rem;
          padding: 0.5rem 0;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: color 0.2s ease;
        }

        .auth-back-button:hover {
          color: #F24822;
        }
      `}</style>
    </div>
  );
}