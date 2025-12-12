'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ScopePreview from '@/components/ScopePreview/scope-preview';
import AndroidNotifyModal from '@/components/AndroidNotifyModal';



export default function LandingPage() {
  const router = useRouter();
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      const hasRedirected = sessionStorage.getItem('pwa_redirected');
      if (!hasRedirected) {
        sessionStorage.setItem('pwa_redirected', 'true');
        router.replace('/learn');
      }
    }
  }, [router]);

  return (
    <div className="landing">
      <div className="container mx-auto">

        <div className="text-center flex flex-col items-center gap-3 mx-auto px-4 max-w-[280px] mb-12">
          <Image src="/images/logo.svg" alt="Tbilingo" width={160} height={64} className='object-contain' />
          <h1 className="text-2xl font-bold">Your First Step to Learning <span className='text-accent-500'>Georgian</span></h1>
          <p className="text-base text-gray-600">Short daily lessons designed for absolute beginners</p>
        </div>

        <div className="flex flex-col gap-3 w-full mx-auto px-4 max-w-[440px] mb-12">

          <Link href="/learn" className="btn btn-primary btn-large btn-block">Learn online</Link>

          <div className="flex flex-col items-center gap-2">
            <button
              className="btn btn-large btn-black btn-block relative"
              onClick={() => setIsAndroidModalOpen(true)}
            >
              <div>
                <div>Play Market</div>
                <span className="text-[10px] uppercase text-gray-400">Coming soon</span>
              </div>
              <svg className='object-contain object-bottom absolute bottom-0 right-3' width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.8076 25.4022C43.3135 25.4023 42.8304 25.255 42.4194 24.979C42.0085 24.7029 41.6881 24.3105 41.4989 23.8514C41.3097 23.3923 41.2602 22.887 41.3565 22.3996C41.4528 21.9121 41.6907 21.4643 42.0401 21.1128C42.3894 20.7613 42.8346 20.5219 43.3193 20.4248C43.8039 20.3278 44.3063 20.3775 44.7629 20.5676C45.2195 20.7577 45.6098 21.0797 45.8845 21.4929C46.1591 21.9061 46.3057 22.3919 46.3058 22.8889C46.3051 23.555 46.0417 24.1937 45.5734 24.6649C45.105 25.136 44.4701 25.4012 43.8076 25.4022ZM16.1924 25.4022C15.6982 25.4023 15.2151 25.255 14.8041 24.979C14.3932 24.7029 14.0728 24.3105 13.8836 23.8514C13.6944 23.3923 13.6448 22.887 13.7412 22.3996C13.8375 21.9121 14.0754 21.4643 14.4247 21.1128C14.7741 20.7613 15.2193 20.5219 15.704 20.4248C16.1886 20.3278 16.691 20.3775 17.1476 20.5676C17.6042 20.7577 17.9945 21.0797 18.2691 21.4929C18.5438 21.9061 18.6904 22.3919 18.6905 22.8889C18.6899 23.5551 18.4265 24.1938 17.9582 24.665C17.4898 25.1362 16.8548 25.4013 16.1924 25.4022ZM44.7036 10.2668L49.6966 1.56954C49.7651 1.45074 49.8095 1.31954 49.8275 1.18344C49.8455 1.04734 49.8367 0.909011 49.8015 0.776357C49.7663 0.643703 49.7054 0.519328 49.6224 0.410337C49.5394 0.301347 49.4358 0.209877 49.3176 0.14116C49.1994 0.0724436 49.0689 0.0278252 48.9336 0.0098552C48.7982 -0.00811483 48.6607 0.000914916 48.5288 0.0364304C48.397 0.0719458 48.2733 0.133251 48.165 0.216839C48.0567 0.300428 47.9659 0.404662 47.8976 0.523584L42.8415 9.33067C38.9752 7.556 34.6328 6.5678 29.9995 6.5678C25.3662 6.5678 21.0243 7.55742 17.158 9.33067L12.1024 0.523584C12.0342 0.404582 11.9435 0.300249 11.8353 0.21655C11.727 0.132852 11.6034 0.0714294 11.4716 0.0357959C11.3397 0.000162415 11.2022 -0.00898395 11.0668 0.0088803C10.9315 0.0267445 10.8009 0.0712687 10.6827 0.139907C10.5644 0.208545 10.4608 0.299951 10.3777 0.408898C10.2946 0.517845 10.2337 0.642196 10.1984 0.774841C10.1632 0.907485 10.1542 1.04582 10.1721 1.18194C10.1901 1.31806 10.2345 1.44929 10.3029 1.56812L15.2964 10.2668C6.72234 14.9568 0.857832 23.6862 0 34H60C59.1412 23.6862 53.2772 14.9568 44.7036 10.2668Z" fill="#3DDC84" /></svg>
            </button>
          </div>

        </div>

        <div className="w-full mx-auto px-4 max-w-[440px]">
          <ScopePreview />
        </div>

      </div>

      <AndroidNotifyModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}