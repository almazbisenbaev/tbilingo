'use client';

import { useEffect, useState } from 'react';
import { checkForUpdates, applyUpdate } from '../utils/pwa-utils';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);

            // Check for updates on page load
            registration.update();

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              console.log('Service Worker update found');
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New service worker installed, update available');
                    setUpdateAvailable(true);
                  }
                });
              }
            });

            // Handle controller change (when new SW takes over)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('New service worker activated');
              window.location.reload();
            });

            // Periodically check for updates
            setInterval(() => {
              checkForUpdates().then((hasUpdate) => {
                if (hasUpdate) {
                  setUpdateAvailable(true);
                }
              });
            }, 60000); // Check every minute
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await applyUpdate();
      // The page will reload automatically when update is successful
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      // Show error message to user
      alert('Update failed. Please refresh the page manually.');
    }
  };

  if (updateAvailable) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F24822', // Match app's primary color
        color: 'white',
        padding: '12px 16px',
        textAlign: 'center',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontFamily: 'var(--font-sans)'
      }}>
        <span>🔄 New version available!</span>
        <button 
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{
            backgroundColor: 'white',
            color: '#F24822', // Match app's primary color
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isUpdating ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isUpdating ? 'Updating...' : 'Update Now'}
        </button>
      </div>
    );
  }

  return null;
}