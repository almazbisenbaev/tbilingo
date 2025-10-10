'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingSpinner({ size = 'md', color = '#ff7658' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-gray-200 border-t-[${color}] rounded-full animate-spin`}
      style={{ borderTopColor: color }}
    />
  );
}