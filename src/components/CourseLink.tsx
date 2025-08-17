import Link from 'next/link';
import Image from 'next/image';
import { CourseLinkProps } from '@/types';

import './CourseLink.css';

/**
 * CourseLink component displays a link to a course with an icon and title
 * Optionally shows progress information when progress data is provided
 */

export default function CourseLink({ href, title, icon, disabled, progress, totalItems, completedItems }: CourseLinkProps) {
    return (
        <>
            <Link 
                href={href} 
                className={`course-link ${disabled ? 'course-link-disabled' : ''}`}
                style={{
                    pointerEvents: (disabled) ? "none" : "auto",
                }}
                aria-label={`${title}${disabled ? ' (coming soon)' : ''}${!disabled && completedItems !== undefined && totalItems !== undefined ? `, ${completedItems} out of ${totalItems} completed` : ''}`}
            >
                <div className='course-link-icon'>
                    <Image src={icon} alt={title} width={38} height={38} />
                </div>
                <div className='course-link-content'>
                    <div className='course-link-title'>{title}</div>
                    {disabled && (
                        <div className='course-link-label'>Coming soon</div>
                    )}
                    {!disabled && progress !== undefined && (
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
