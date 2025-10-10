'use client';

import Brand from '@/components/Brand/Brand';
import ScopePreview from '@/components/ScopePreview/scope-preview';

interface WelcomeScreenProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({ onSignUp, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-inner">
        <div className="welcome-header">
          <Brand />
        </div>

        <div className="welcome-actions">
          <button 
            onClick={onSignUp}
            className="btn btn-primary btn-block"
          >
            Sign Up (free)
          </button>
          <button 
            onClick={onSignIn}
            className="btn btn-block"
          >
            Sign In
          </button>
        </div>

        <ScopePreview />
      </div>
    </div>
  );
}