import Link from 'next/link';
import Image from 'next/image';
import { CourseLinkProps } from '@/types';

import './CourseLink.css';

export default function CourseLink({ href, title, icon, disabled }: CourseLinkProps) {
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
                </div>
            </Link>
        </>
    )
}
