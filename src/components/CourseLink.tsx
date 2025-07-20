import Link from 'next/link';
import Image from 'next/image';

import './CourseLink.css';

export default function CourseLink({href, title, icon, disabled}: {href: string, title: string, icon: string, disabled: boolean}){
    return (
        <>
            <Link 
                href={href} 
                className='course-link'   
                style={{
                    pointerEvents: (disabled) ? "none" : "auto",
                }}
            >
                <div className='course-link-icon'>
                    <Image src={icon} alt={title} width={32} height={32} />
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
