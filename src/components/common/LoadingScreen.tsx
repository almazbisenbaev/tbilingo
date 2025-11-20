'use client';

import LoadingSpinner from './LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  showSpinner = true 
}: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      {showSpinner && <LoadingSpinner size="lg" />}
      {message && <p className="mt-4 text-gray-600">{message}</p>}
      
      <style jsx>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100svh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      `}</style>
    </div>
  );
}