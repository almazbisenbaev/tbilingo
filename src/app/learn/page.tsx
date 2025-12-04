"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TabBar, { TabType } from '@/components/TabBar';
import SettingsTab from '@/components/SettingsTab';
import AnimatedTabContent from '@/components/AnimatedTabContent';
import LoadingScreen from '@/components/common/LoadingScreen';
import LearnTab from '@/components/screens/LearnTab';
import GoogleSignInButton from '@/components/GoogleSignInButton/GoogleSignInButton';
import Image from "next/image";

// --- Types ---

type AuthMode = 'login' | 'signup' | null;

// --- Main Component ---

export default function LearnApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  if (currentUser === undefined) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (!currentUser) {
    if (authMode === 'login') {
      return (
        <div className="welcome">
          <div className="welcome-inner">
            <LoginView
              onSwitchToSignup={() => setAuthMode('signup')}
              onClose={() => setAuthMode(null)}
            />
          </div>
        </div>
      );
    }

    if (authMode === 'signup') {
      return (
        <div className="welcome">
          <div className="welcome-inner">
            <SignupView
              onSwitchToLogin={() => setAuthMode('login')}
              onClose={() => setAuthMode(null)}
            />
          </div>
        </div>
      );
    }

    return (
      <AuthView
        onSignUp={() => setAuthMode('signup')}
        onSignIn={() => setAuthMode('login')}
      />
    );
  }

  return (
    <div className="app-with-tabs">
      <div className="tab-content">
        <AnimatedTabContent
          activeTab={activeTab}
          tabs={{
            learn: <LearnTab />,
            settings: <SettingsTab />,
          }}
        />
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// --- Sub Components ---

interface AuthViewProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

function AuthView({ onSignUp, onSignIn }: AuthViewProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
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

interface LoginViewProps {
  onSwitchToSignup: () => void;
  onClose: () => void;
}

function LoginView({ onSwitchToSignup, onClose }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { login, loginWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError('Failed to log in. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onClose();
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

  const handleForgotPassword = async () => {
    if (!email) {
      return setError('Please enter your email address first');
    }

    try {
      setError('');
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else {
        setError('Failed to send reset email. Please try again');
      }
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
        <h2>Welcome Back</h2>
        <p>Sign in to continue learning Georgian</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {resetEmailSent && (
        <div className="success-message">
          Password reset email sent! Check your inbox.
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        disabled={loading}
      />

      <div className="auth-links">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="link-button"
        >
          Forgot your password?
        </button>
      </div>

      <div className="auth-switch">
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="link-button"
          >
            Sign up
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

        .success-message {
          background: #f0f9ff;
          color: #0369a1;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          border: 1px solid #bae6fd;
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

        .auth-links {
          text-align: center;
          margin: 1.5rem 0 1rem 0;
        }

        .auth-switch {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
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

interface SignupViewProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

function SignupView({ onSwitchToLogin, onClose }: SignupViewProps) {
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
      onClose();
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
      onClose();
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

      <GoogleSignInButton
        onClick={handleGoogleSignIn}
        disabled={loading}
      />

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