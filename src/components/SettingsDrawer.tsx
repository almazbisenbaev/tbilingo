"use client";

import { useState } from 'react';
import { useFontStore } from '@/stores/fontStore';

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
      {/* Reset Confirmation Dialog */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-500">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg text-center font-semibold mb-6">Are you sure you want to reset your learning progress?</h3>
            <p className="text-center text-gray-600 mb-6">This will clear all your learned letters and cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={cancelReset}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReset}
                className="btn btn-primary flex-1"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Progress Reset Successfully!</h3>
              <p className="text-gray-600">Your learning progress has been cleared.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}