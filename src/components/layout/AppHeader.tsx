'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  title: string | React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
  customBackIcon?: React.ReactNode;
}

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  backHref,
  onBackClick,
  rightContent,
  customBackIcon
}: AppHeaderProps) {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  const BackIcon = customBackIcon || (
    <Image
      src="/images/icon-back.svg"
      alt="Back"
      width={24}
      height={24}
    />
  );

  return (
    <div className="navbar">
      <div className="navbar-row">
        <div className="navbar-aside">
          {showBackButton && (
            <>
              {backHref ? (
                <Link href={backHref} className="navbar-button">
                  {BackIcon}
                </Link>
              ) : (
                <button onClick={handleBackClick} className="navbar-button">
                  {BackIcon}
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