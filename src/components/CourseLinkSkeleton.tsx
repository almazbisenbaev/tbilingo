/**
 * Course Link Skeleton Loader
 * Shows a loading placeholder while course data is being fetched
 */

import React from 'react';

export default function CourseLinkSkeleton() {
  return (
    <div className="course-link-skeleton">
      <div className="skeleton-content">
        {/* Icon skeleton */}
        <div className="skeleton-icon" />
        
        {/* Content skeleton */}
        <div className="skeleton-text">
          {/* Title skeleton */}
          <div className="skeleton-title" />
          {/* Progress skeleton */}
          <div className="skeleton-progress" />
        </div>
      </div>

      <style jsx>{`
        .course-link-skeleton {
          padding: 20px;
          margin: 10px 0;
          background-color: #f8f9fa;
          border-radius: 12px;
          border: 2px solid #e9ecef;
          opacity: 0.7;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .skeleton-icon {
          width: 48px;
          height: 48px;
          background-color: #dee2e6;
          border-radius: 8px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-text {
          flex: 1;
        }

        .skeleton-title {
          width: 60%;
          height: 20px;
          background-color: #dee2e6;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-progress {
          width: 40%;
          height: 14px;
          background-color: #dee2e6;
          border-radius: 4px;
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