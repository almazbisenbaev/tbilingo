'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CourseLinkProps } from '@/types';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import { useState, useEffect } from 'react';

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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only show progress if mounted AND we have actual data
    const shouldShowProgress = isMounted && !disabled && progress !== undefined && progress >= 0;

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
