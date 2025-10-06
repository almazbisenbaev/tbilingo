/**
 * Course Page Loading Component
 * Shows a loading state with proper styling for course pages
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CoursePageLoadingProps {
  courseTitle: string;
  message?: string;
}

export default function CoursePageLoading({ 
  courseTitle, 
  message = "Loading course content..." 
}: CoursePageLoadingProps) {
  return (
    <div className='h-svh flex flex-col justify-between py-4'>
      {/* Header with back button */}
      <div className='w-full max-w-2xl mx-auto p-4'>
        <div className="navbar">
          <div className="navbar-row">
            <div className="navbar-aside">
              <Link href="/" className='navbar-button'>
                <Image
                  src="/images/icon-back.svg"
                  alt="Back"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
            <h1 className="navbar-title">{courseTitle}</h1>
            <div className="navbar-aside"></div>
          </div>
        </div>
      </div>

      {/* Loading content */}
      <div className='w-full max-w-2xl mx-auto p-4 flex-grow flex items-center justify-center'>
        <div style={{ textAlign: 'center' }}>
          {/* Loading spinner */}
          <div 
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}
          />
          
          {/* Loading message */}
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            margin: '0'
          }}>
            {message}
          </p>
        </div>
      </div>

      {/* Empty footer space */}
      <div className='w-full max-w-2xl mx-auto p-4'>
        {/* Empty space for layout consistency */}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}