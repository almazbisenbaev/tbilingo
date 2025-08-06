import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// This hook ensures that on any route except '/', the back button always returns to home and never further back
export const useBackToHomeNavigation = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;

    // If the previous page is not '/', replace the history so that the only way back is to '/'
    // This works by pushing '/' and then replacing the current state with the current path
    // So the stack is: [/, /current]
    if (window.history.length <= 2) {
      window.history.pushState(null, '', '/');
      window.history.replaceState(null, '', pathname);
    } else {
      // For safety, always ensure the stack is [/, /current]
      window.history.pushState(null, '', '/');
      window.history.replaceState(null, '', pathname);
    }

    const handlePopState = (event: PopStateEvent) => {
      // If user presses back, always go to home
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);
}; 