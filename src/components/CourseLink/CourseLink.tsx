import Link from 'next/link';
import Image from 'next/image';
import { CourseLinkProps } from '@/types';
import { useStoreHydration } from '@/stores/progressStore';
import ProgressBar from '@/components/ProgressBar/ProgressBar';

import './CourseLink.css';

/**
 * CourseLink component displays a link to a course with an icon and title
 * Optionally shows progress information when progress data is provided
 */

export default function CourseLink({ 
  href, 
  title, 
  icon, 
  disabled = false, 
  locked = false,
  progress = 0, 
  totalItems = 0, 
  completedItems = 0,
  onLockedClick
}: CourseLinkProps) {
  const isHydrated = useStoreHydration();
  
  // Only show progress if hydrated AND we have actual data
  const shouldShowProgress = isHydrated && !disabled && progress !== undefined && progress >= 0;
  
  // Debug log to check the props being received
  console.log(`CourseLink [${title}]:`, { progress, completedItems, totalItems, isHydrated, shouldShowProgress, locked });
  
  // Handle locked course click
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (locked) {
      e.preventDefault();
      onLockedClick?.();
    }
  };
  
    return (
        <>
            <Link 
                href={href} 
                className={`course-link ${disabled ? 'course-link-disabled' : ''}`}
                style={{
                    pointerEvents: (disabled) ? "none" : "auto",
                    opacity: locked ? 0.3 : 1
                }}
                onClick={handleClick}
            >
                <div className='course-link-icon'>
                    <Image src={icon} alt={title} width={38} height={38} />
                </div>
                <div className='course-link-content'>
                    <div className='course-link-title'>{title}</div>
                    {disabled && (
                        <div className='course-link-label'>Coming soon</div>
                    )}
                    {shouldShowProgress && (
                        <div className='course-link-progress'>
                            <ProgressBar 
                                current={completedItems || 0}
                                total={totalItems || 0}
                                width="100%"
                            />
                        </div>
                    )}
                </div>
            </Link>
        </>
    )
}
