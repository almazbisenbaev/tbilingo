'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  title: string | React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  backHref,
  onBackClick,
  rightContent 
}: AppHeaderProps) {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-row">
        <div className="navbar-aside">
          {showBackButton && (
            <>
              {backHref ? (
                <Link href={backHref} className="navbar-button">
                  <Image
                    src="/images/icon-back.svg"
                    alt="Back"
                    width={24}
                    height={24}
                  />
                </Link>
              ) : (
                <button onClick={handleBackClick} className="navbar-button">
                  <Image
                    src="/images/icon-back.svg"
                    alt="Back"
                    width={24}
                    height={24}
                  />
                </button>
              )}
            </>
          )}
        </div>
        <div className="navbar-title">{title}</div>
        <div className="navbar-aside">
          {rightContent}
        </div>
      </div>
    </div>
  );
}