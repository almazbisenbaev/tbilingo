import Image from 'next/image';
import Link from 'next/link';
import ScopePreview from '@/components/ScopePreview/scope-preview';

export default function LandingPage() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-xl mx-auto text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Image src="/images/logo.png" alt="Tbilingo" width={220} height={94} />
          <h1 className="text-2xl font-semibold">Your First Step to Learning Georgian</h1>
          <p className="text-base text-gray-600">Short daily lessons designed for beginners</p>
        </div>
        <div className="flex justify-center">
          <Link href="/learn" className="btn btn-primary">Learn now</Link>
        </div>
        <div className="mt-8">
          <ScopePreview />
        </div>
      </div>
    </div>
  );
}