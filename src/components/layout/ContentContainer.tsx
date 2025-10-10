'use client';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function ContentContainer({ 
  children, 
  className = '', 
  maxWidth = '2xl' 
}: ContentContainerProps) {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className={`w-full ${maxWidthClass} mx-auto p-4 ${className}`}>
      {children}
    </div>
  );
}