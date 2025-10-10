'use client';

import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  showRetry?: boolean;
}

export default function ErrorState({ 
  title = 'Something went wrong',
  message,
  actionText = 'Go Home',
  actionHref = '/',
  onActionClick,
  showRetry = true
}: ErrorStateProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
  };

  return (
    <div className="error-state">
      <div className="error-content">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {showRetry && (
            <button 
              onClick={handleRetry}
              className="btn btn-primary"
            >
              Retry
            </button>
          )}
          
          {actionHref ? (
            <Link href={actionHref} className="btn btn-secondary">
              {actionText}
            </Link>
          ) : (
            <button onClick={handleActionClick} className="btn btn-secondary">
              {actionText}
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      `}</style>
    </div>
  );
}