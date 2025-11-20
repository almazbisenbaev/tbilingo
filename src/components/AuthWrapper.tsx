'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import SignupPage from '@/components/SignupPage';
import LearnTab from '@/components/LearnTab';
import WelcomeScreen from '@/components/welcome-screen/welcome-screen';

type AuthMode = 'login' | 'signup' | null;

export default function AuthWrapper() {
  const { currentUser } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  // If user is authenticated, show the learn content
  if (currentUser) {
    return <LearnTab />;
  }

  // If user clicked on login or signup, show the respective form
  if (authMode === 'login') {
    return (
      <div className="welcome">
        <div className="welcome-inner">
          <LoginPage 
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
          <SignupPage 
            onSwitchToLogin={() => setAuthMode('login')}
            onClose={() => setAuthMode(null)}
          />
        </div>
      </div>
    );
  }

  // Default state: show welcome screen with auth buttons
  return (
    <WelcomeScreen 
      onSignUp={() => setAuthMode('signup')}
      onSignIn={() => setAuthMode('login')}
    />
  );
}