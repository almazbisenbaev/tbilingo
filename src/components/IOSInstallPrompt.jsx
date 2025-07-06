import { useState, useEffect } from 'react';
import './IOSInstallPrompt.css';

const IOSInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the device is iOS and using Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Check if the app is not already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone;
    
    setIsVisible(isIOS && isSafari && !isStandalone);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="ios-install-prompt">
      <div className="ios-install-prompt-content">
        <button 
          className="ios-install-prompt-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close installation instructions"
        >
          ×
        </button>
        <h3>Install This App</h3>
        <p>Install this app on your iOS device for the best experience:</p>
        <ol>
          <li>Tap the <span className="ios-share-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
            </svg>
          </span> share button</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" in the top right</li>
        </ol>
      </div>
    </div>
  );
};

export default IOSInstallPrompt; 