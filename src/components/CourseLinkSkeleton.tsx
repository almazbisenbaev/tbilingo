/**
 * Course Link Skeleton Loader
 * Shows a loading placeholder while course data is being fetched
 */

import React from 'react';

export default function CourseLinkSkeleton() {
  return (
    <div className="course-link-skeleton">
      <style jsx>{`
        .course-link-skeleton {
          width: 100%;
          min-height: 96px;
          background-color: #f0f0f0;
          border-radius: 16px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}