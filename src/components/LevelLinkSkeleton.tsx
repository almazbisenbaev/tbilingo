/**
 * Level Link Skeleton Loader
 * Shows a loading placeholder while level data is being fetched
 */

import React from 'react';

export default function LevelLinkSkeleton() {
  return (
    <div className="level-link-skeleton">
      <style jsx>{`
        .level-link-skeleton {
          width: 100%;
          min-height: 96px;
          background-color: rgba(255,255,255,.5);
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