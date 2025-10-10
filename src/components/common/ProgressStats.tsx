'use client';

interface ProgressStatsProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

export default function ProgressStats({ 
  completed, 
  total, 
  label = 'Progress',
  className = '' 
}: ProgressStatsProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`text-center ${className}`}>
      <div className="progress-stats">
        {label && <span className="progress-label">{label}: </span>}
        <span className="progress-numbers">
          <strong>{completed}</strong> out of <strong>{total}</strong>
        </span>
        {total > 0 && (
          <span className="progress-percentage">
            {' '}({percentage}%)
          </span>
        )}
      </div>
    </div>
  );
}