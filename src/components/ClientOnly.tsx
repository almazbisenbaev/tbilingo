'use client';

import { useEffect, useState, type ReactNode } from 'react';

type ClientOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
  /** 
   * If true, will not render children during SSR (avoids hydration mismatch)
   * If false, will render children during SSR but delay effects until mounted
   * @default true
   */
  ssr?: boolean;
};

/**
 * A component that only renders its children on the client side.
 * This is useful for components that rely on browser APIs like `window` or `document`.
 * 
 * @example
 * // Will only render on the client, with a loading fallback during SSR
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <ClientSideComponent />
 * </ClientOnly>
 * 
 * @example
 * // Will render on server but delay effects until mounted
 * <ClientOnly ssr={false}>
 *   <ClientSideComponent />
 * </ClientOnly>
 */
export default function ClientOnly({ 
  children, 
  fallback = null,
  ssr = true 
}: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If we're on the server and ssr is false, don't render anything
  if (typeof window === 'undefined' && ssr === false) {
    return null;
  }

  // If we're on the client and the component hasn't mounted yet, show fallback
  if (!mounted && ssr === false) {
    return <>{fallback}</>;
  }

  // If we're on the client and ssr is true, always render children
  // (they'll be hydrated on the client)
  return <>{children}</>;
}
