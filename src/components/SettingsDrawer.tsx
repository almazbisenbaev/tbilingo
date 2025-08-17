"use client";

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
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
      <button 
        className="welcome-settings-btn" 
        onClick={() => setShowSettings(true)}
      >
        Settings
      </button>
      
      <Transition appear show={showSettings} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowSettings(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title as="h2" className="text-lg font-semibold">
                            Settings
                          </Dialog.Title>
                          <button
                            type="button"
                            className="welcome-settings-close"
                            onClick={() => setShowSettings(false)}
                            aria-label="Close settings"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-6">
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
                            <button 
                              className='reset-button' 
                              onClick={onReset}
                            >
                              <img src="/images/icon-reset-red.svg" alt="" />
                              <span>Reset progress</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

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