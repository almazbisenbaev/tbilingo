// PWA utility functions for version management and update detection

export const PWA_VERSION = '1.0.1';

export function checkForUpdates(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
          
          const checkUpdate = () => {
            if (registration.waiting) {
              resolve(true);
            } else {
              resolve(false);
            }
          };
          
          registration.addEventListener('updatefound', checkUpdate);
          // Check immediately
          checkUpdate();
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}

export function applyUpdate(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controller change
      const handleControllerChange = () => {
        window.location.reload();
        resolve();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Update timeout'));
      }, 5000);
    } else {
      reject(new Error('No service worker controller'));
    }
  });
}

export function getCurrentVersion(): string {
  return PWA_VERSION;
} 