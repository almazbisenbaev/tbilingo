'use client';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`h-svh flex flex-col justify-between py-4 ${className}`}>
      {children}
    </div>
  );
}