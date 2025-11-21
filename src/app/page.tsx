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
        <div className="flex flex-col items-center gap-4">
          <Link href="/learn" className="btn btn-primary btn-large w-72 justify-center">Learn online</Link>
          <div className="flex flex-col items-center gap-2">
            <button className="btn bg-black text-white btn-large w-72 justify-center opacity-50 cursor-not-allowed" disabled>
              <Image src="/images/icon-android.svg" alt="Android" width={28} height={28} />
              Play Market
            </button>
            <span className="text-sm text-gray-500">(Coming soon)</span>
          </div>
        </div>
        <div className="mt-8">
          <ScopePreview />
        </div>
      </div>
    </div>
  );
}