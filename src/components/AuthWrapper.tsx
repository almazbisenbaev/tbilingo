'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import SignupPage from '@/components/SignupPage';
import LearnTab from '@/components/LearnTab';
import Brand from './Brand/Brand';

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
        <LoginPage 
          onSwitchToSignup={() => setAuthMode('signup')}
          onClose={() => setAuthMode(null)}
        />
      </div>
    );
  }

  if (authMode === 'signup') {
    return (
      <div className="welcome">
        <SignupPage 
          onSwitchToLogin={() => setAuthMode('login')}
          onClose={() => setAuthMode(null)}
        />
      </div>
    );
  }

  // Default state: show welcome screen with auth buttons
  return (
    <div className="welcome">

      <div className="welcome-header">
        <Brand />
      </div>

      <div className="welcome-actions">
        <button 
          onClick={() => setAuthMode('signup')}
          className="btn btn-primary btn-block"
        >
          Sign Up (free)
        </button>
        <button 
          onClick={() => setAuthMode('login')}
          className="btn btn-block"
        >
          Sign In
        </button>
      </div>

      <div className="course-preview-section">
        <h3 className="course-preview-title">What you'll learn:</h3>
        <div className="course-preview-grid">
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <img src="/images/icon-alphabet.svg" alt="Georgian Alphabet" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Learn Alphabet</div>
              <div className="course-preview-desc">Georgian letters & sounds</div>
            </div>
          </div>
          
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <img src="/images/icon-numbers.svg" alt="Georgian Numbers" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Learn Numbers</div>
              <div className="course-preview-desc">Numbers in Georgian</div>
            </div>
          </div>
          
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <img src="/images/icon-phrases.svg" alt="Georgian Phrases" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Words & Phrases - Basic</div>
              <div className="course-preview-desc">Essential Georgian words and phrases</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .course-preview-section {
          margin-top: 3rem;
          width: 100%;
          max-width: 480px;
        }

        .course-preview-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .course-preview-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .course-preview-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid #F2482220;
          border-radius: 16px;
          opacity: 0.9;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .course-preview-item:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.95);
          border-color: #F2482240;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(242, 72, 34, 0.1);
        }

        .course-preview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
        }

        .course-preview-icon img {
          width: 38px;
          height: 38px;
          opacity: 0.7;
        }

        .course-preview-content {
          flex: 1;
        }

        .course-preview-name {
          font-size: 1rem;
          font-weight: 600;
          color: #F24822;
          margin-bottom: 2px;
        }

        .course-preview-desc {
          font-size: 0.875rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}