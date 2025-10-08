import Link from 'next/link';
import Image from 'next/image';
import { CourseLinkProps } from '@/types';
import { useStoreHydration } from '@/stores/progressStore';

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
  progress = 0, 
  totalItems = 0, 
  completedItems = 0 
}: CourseLinkProps) {
  const isHydrated = useStoreHydration();
  
  // Only show progress if hydrated AND we have actual data
  const shouldShowProgress = isHydrated && !disabled && progress !== undefined && progress >= 0;
  
  // Debug log to check the props being received
  console.log(`CourseLink [${title}]:`, { progress, completedItems, totalItems, isHydrated, shouldShowProgress });
    return (
        <>
            <Link 
                href={href} 
                className={`course-link ${disabled ? 'course-link-disabled' : ''}`}
                style={{
                    pointerEvents: (disabled) ? "none" : "auto",
                }}
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
                            <div className='progress-bar'>
                                <div 
                                    className='progress-fill' 
                                    style={{ width: `${progress}%` }}
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    role="progressbar"
                                ></div>
                            </div>
                            {completedItems !== undefined && totalItems !== undefined && (
                                <div className='progress-text'>
                                    {completedItems}/{totalItems} completed
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </>
    )
}
