'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';
import { Button } from '@/components/ui/button';


export default function SettingsTab() {

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { currentUser, logout } = useAuth();



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
      <div className="pb-20 flex flex-col justify-between">

        {currentUser && (
          <div className="flex flex-col items-center py-5 mb-24">
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

        <div className="text-sm text-center flex justify-center items-center gap-[0.3em] px-5 mt-8">Made by <a target="_blank" href="https://www.threads.com/@almazbisenbaev">Almaz Bisenbaev</a></div>

      </div>

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