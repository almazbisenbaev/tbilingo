"use client";

import { useState } from 'react';
import { useFontStore } from '@/stores/fontStore';
import ConfirmationDialog from './ConfirmationDialog';
import SuccessPopup from './SuccessPopup';

export default function SettingsDrawer() {
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const { fontType, setFontType } = useFontStore();

  const onFontSettingChange = (event: any) => {
    const choice = event.target.value;
    setFontType(choice);
  };

  const onReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('learnedLetters');
    setShowResetConfirmation(false);
    setShowSettings(false);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  return (
    <>
      <button className="welcome-settings-btn" onClick={() => {setShowSettings(true)}}>Settings</button>
      <div className={`settings-drawer ${showSettings ? 'settings-drawer-shown' : ''}`}>
        <button className='welcome-settings-close' onClick={() => {setShowSettings(false)}}>Close</button>
        <div className="settings-items">
          <div className="settings-item">
            <div className="settings-ff">
              <div>Character font type: </div>
              <div className='settings-ff-items'>
                <label className='settings-ff-item settings-ff-item-sans'>
                  <input name='font-type' 
                    type="radio" 
                    value='sans' 
                    checked={fontType === 'sans'}
                    onChange={onFontSettingChange}
                  />
                  <div className="settings-ff-item-preview">ჯ ფ ტ</div>
                </label>
                <label className='settings-ff-item settings-ff-item-serif'>
                  <input name='font-type' 
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
            <button className='reset-button' onClick={onReset}>
              <img src="/images/icon-reset-red.svg" alt="" />
              <span>Reset progress</span>
            </button>
          </div>
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
      <SuccessPopup
        isOpen={showSuccessPopup}
        title="Progress Reset Successfully!"
        message="Your learning progress has been cleared."
        onClose={() => setShowSuccessPopup(false)}
      />
    </>
  );
}