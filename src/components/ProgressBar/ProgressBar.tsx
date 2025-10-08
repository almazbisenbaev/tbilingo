import React from 'react';
import { ProgressBarProps } from '@/types';
import './ProgressBar.css';

/**
 * Isolated progress bar component for showing completion progress
 * Designed to look identical to the existing progress bars but be completely self-contained
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  showText = true,
  width = '200px' 
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="words-progress-container" style={{ width }}>
      <div className="words-progress-bar">
        <div 
          className="words-progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showText && (
        <div className="words-progress-text">
          {current} / {total}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;