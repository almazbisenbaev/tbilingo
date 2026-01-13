import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface LevelNavbarProps {
  title: string;
  onBackClick?: () => void;
  backHref?: string;
  showBackButton?: boolean;
}

export default function LevelNavbar({
  title,
  onBackClick,
  backHref = '/learn',
  showBackButton = true,
}: LevelNavbarProps) {
  if (!showBackButton) {
    return (
      <div className="navbar">
        <div className="navbar-row">
          <div className="navbar-aside"></div>
          <h1 className="navbar-title">{title}</h1>
          <div className="navbar-aside"></div>
        </div>
      </div>
    );
  }

  if (onBackClick) {
    // Button version (for when onClick handler is provided)
    return (
      <div className="navbar">
        <div className="navbar-row">
          <div className="navbar-aside">
            <button onClick={onBackClick} className="navbar-button">
              <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
            </button>
          </div>
          <h1 className="navbar-title">{title}</h1>
          <div className="navbar-aside"></div>
        </div>
      </div>
    );
  }

  // Link version (for navigation)
  return (
    <div className="navbar">
      <div className="navbar-row">
        <div className="navbar-aside">
          <Link href={backHref} className="navbar-button">
            <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
          </Link>
        </div>
        <h1 className="navbar-title">{title}</h1>
        <div className="navbar-aside"></div>
      </div>
    </div>
  );
}
