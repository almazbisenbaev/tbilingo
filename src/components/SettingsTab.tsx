'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFontTypeStore } from '@/stores/fontTypeStore';
import { useProgressStore } from '@/stores/progressStore';
import ConfirmationDialog from './ShadcnConfirmationDialog';
import SuccessModal from './ShadcnSuccessModal';
import { Button } from '@/components/ui/button';

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
      <div className="settings-content min-h-screen flex flex-col justify-between">
        <div className="settings-header">
          {currentUser && (
            <div className="user-info flex justify-between align-center">
              <p>Welcome, {currentUser.displayName || currentUser.email}!</p>

              <div>
                <Button 
                  variant="link"
                  size="sm"
                  className="text-red-600 hover:text-red-700 p-0 h-auto"
                  onClick={onLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>

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

        </div>
        <div className="credits">Made by <a target="_blank" href="https://www.threads.com/@almazbisenbaev">Almaz Bisenbaev</a></div>
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

    </>
  );
}