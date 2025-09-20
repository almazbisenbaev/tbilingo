'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      // Hide the install button when the app is installed
      setIsVisible(false);
      setTimeout(() => {
        setShowInstallButton(false);
      }, 300);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for the appinstalled event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Handles the user clicking the install button
   * Triggers the browser's native PWA installation prompt
   * and manages UI state based on user's response
   */
  const handleInstallClick = async () => {
    if (!deferredPrompt) return; // Safety check if prompt isn't available

    // Show the browser's native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt (accept or dismiss)
    const { outcome } = await deferredPrompt.userChoice;

    // Log the user's choice for analytics/debugging
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clean up after prompt is handled
    setDeferredPrompt(null); // Clear the prompt reference
    setIsVisible(false); // Hide the install UI immediately
    setTimeout(() => {
      setShowInstallButton(false); // Completely remove the install button after animation
    }, 300); // Short delay for animation to complete
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className={`pwa-install-container ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}>
      <button
        onClick={handleInstallClick}
        className="pwa-install-button"
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        Install App
      </button>
    </div>
  );
}