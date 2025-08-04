import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useBackButtonHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Only handle back button on home page
    if (pathname !== '/') {
      return;
    }

    // Add an entry to history when on home page to ensure we can detect back button
    window.history.pushState(null, '', '/');

    const handlePopState = (event: PopStateEvent) => {
      // Prevent the default back navigation
      event.preventDefault();
      
      // Try to close the app
      if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
        // This is a PWA, try to close the app
        try {
          window.close();
        } catch (e) {
          // If window.close() fails, try alternative approach
          window.location.href = 'about:blank';
        }
      } else {
        // For regular browser, try to close directly first
        try {
          window.close();
        } catch (e) {
          // If window.close() fails, show a confirmation dialog
          if (confirm('Do you want to close the app?')) {
            window.location.href = 'about:blank';
          } else {
            // If user cancels, push a new state to prevent going back
            window.history.pushState(null, '', '/');
          }
        }
      }
    };

    // Add event listener for popstate (back button)
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);
}; 