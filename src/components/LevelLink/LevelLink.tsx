'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LevelLinkProps } from '@/types';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import { useState, useEffect } from 'react';

import './LevelLink.css';

/**
 * LevelLink component displays a link to a level with an icon and title
 * Optionally shows progress information when progress data is provided
 */

export default function LevelLink({
    href,
    title,
    icon,
    disabled = false,
    locked = false,
    isCompleted: isCompletedProp = false,
    progress = 0,
    totalItems = 0,
    completedItems = 0,
    onLockedClick
}: LevelLinkProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only show progress if mounted AND we have actual data
    const shouldShowProgress = isMounted && !disabled && progress !== undefined && progress >= 0;

    const isCompleted = isCompletedProp || progress === 100;

    // Handle locked level click
    const handleCardClick = () => {
        if (locked) {
            onLockedClick?.();
        }
    };

    return (
        <div
            className={`level-link ${disabled ? 'level-link-disabled' : ''} ${isCompleted ? 'level-link-completed' : ''} ${locked ? 'level-link-locked cursor-pointer' : ''}`}
            onClick={handleCardClick}
        >
            <div className='level-link-row'>
                <div className='level-link-icon'>
                    <Image src={icon} alt={title} width={38} height={38} />
                </div>
                <div className='level-link-content'>
                    <div className='level-link-title'>{title}</div>
                    {disabled && (
                        <div className='level-link-label'>Coming soon</div>
                    )}
                    {shouldShowProgress && (
                        <div className='level-link-progress'>
                            <ProgressBar
                                current={completedItems || 0}
                                total={totalItems || 0}
                                width="100%"
                            />
                        </div>
                    )}
                </div>
            </div>

            {!locked && !disabled && !isCompleted && (
                <div className="mt-4">
                    <Link href={href} className="btn btn-primary btn-block">
                        Learn now
                    </Link>
                </div>
            )}

        </div>
    )
}
