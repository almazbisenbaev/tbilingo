'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFontTypeStore } from '@/stores/fontTypeStore';
import { useProgressStore } from '@/stores/progressStore';
import ConfirmationDialog from './ShadcnConfirmationDialog';
import SuccessModal from './ShadcnSuccessModal';

export default function SettingsTab() {
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { currentUser, logout } = useAuth();
  const { fontType, setFontType } = useFontTypeStore();
  const { resetAllProgress } = useProgressStore();

  const onFontSettingChange = (event: any) => {
    const choice = event.target.value;
    setFontType(choice);
  };

  const onReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    resetAllProgress();
    setShowResetConfirmation(false);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  const onLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setShowLogoutConfirmation(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          {currentUser && (
            <div className="user-info">
              <p>Welcome, {currentUser.displayName || currentUser.email}!</p>
            </div>
          )}
        </div>
        <div className="settings-items">
          <div className="settings-item">
            <div className="settings-ff">
              <div>Character font type: </div>
              <div className='settings-ff-items'>
                <label className='settings-ff-item settings-ff-item-sans'>
                  <input 
                    name='font-type' 
                    type="radio" 
                    value='sans' 
                    checked={fontType === 'sans'}
                    onChange={onFontSettingChange}
                  />
                  <div className="settings-ff-item-preview">ჯ ფ ტ</div>
                </label>
                <label className='settings-ff-item settings-ff-item-serif'>
                  <input 
                    name='font-type' 
                    type="radio" 
                    value='serif' 
                    checked={fontType === 'serif'}
                    onChange={onFontSettingChange}
                  />
                  <div className="settings-ff-item-preview">ჯ ფ ტ</div>
                </label>
              </div>
              <div className="hint">We recommend learning the letters in both font types</div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="settings-item">
            <button 
              className='reset-button' 
              onClick={onReset}
            >
              <Image 
                src="/images/icon-reset-red.svg" 
                alt="Reset" 
                width={16}
                height={16}
              />
              <span>Reset progress</span>
            </button>
          </div>
          {currentUser && (
            <>
              <div className="divider"></div>
              <div className="settings-item">
                <button 
                  className='logout-button' 
                  onClick={onLogout}
                  disabled={logoutLoading}
                >
                  <span>{logoutLoading ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="welcome-footer">
          <div className="credits">Made by <a target="_blank" href="https://www.threads.com/@almazbisenbaev">Almaz Bisenbaev</a></div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showResetConfirmation}
        title="Are you sure you want to reset your learning progress?"
        message="This will clear all your learned letters and cannot be undone."
        confirmText="Reset Progress"
        cancelText="Cancel"
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
      <SuccessModal
        isOpen={showSuccessPopup}
        title="Progress Reset Successfully!"
        message="Your learning progress has been cleared."
        onClose={() => setShowSuccessPopup(false)}
      />
      <ConfirmationDialog
        isOpen={showLogoutConfirmation}
        title="Are you sure you want to sign out?"
        message="You can always sign back in to continue your learning journey."
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <style jsx>{`
        .user-info {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .user-info p {
          margin: 0;
          color: #475569;
          font-size: 0.875rem;
        }

        .logout-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          color: #dc2626;
          border: 2px solid #dc2626;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-button:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }

        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}