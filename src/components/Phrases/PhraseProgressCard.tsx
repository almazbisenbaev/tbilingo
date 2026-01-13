import { useState, useEffect } from 'react';
import { PhraseItem, PhraseMemory } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import Image from 'next/image';

interface PhraseProgressCardProps {
  levelId: string;
  course: { title: string; description: string; icon: string };
  phrases: PhraseItem[];
  onLoading: () => void;
  onLoaded: (learnedIds: number[], itemProgress: Record<string, number>) => void;
}

export default function PhraseProgressCard({
  levelId,
  course,
  phrases,
  onLoading,
  onLoaded,
}: PhraseProgressCardProps) {
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      onLoading();
      setLearnedCount(0);

      try {
        const user = auth.currentUser;
        let learnedIds: number[] = [];
        let itemProgress: Record<string, number> = {};

        if (user) {
          const progressRef = doc(db, 'users', user.uid, 'progress', String(levelId));
          const progressSnap = await getDoc(progressRef);
          const learnedItemIds: string[] = progressSnap.exists()
            ? (((progressSnap.data() as any).learnedItemIds as string[]) || [])
            : [];
          itemProgress = progressSnap.exists() ? ((progressSnap.data() as any).itemProgress || {}) : {};
          learnedIds = learnedItemIds.map((id) => parseInt(id));
        }

        if (cancelled) return;

        setLearnedCount(learnedIds.length);
        onLoaded(learnedIds, itemProgress);
      } catch (e) {
        console.error('Error loading progress:', e);
        if (!cancelled) {
          setLearnedCount(0);
          onLoaded([], {});
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // Intentionally mount-only: the parent toggles this card on/off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-480 level-intro-content">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="mb-4 relative w-24 h-24">
          <Image src={course.icon} alt={course.title} fill className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
        <p className="text-gray-500">{course.description}</p>
      </div>

      <div className=" w-full bg-white/50 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-500">Progress</span>
          <span className="text-2xl font-bold text-primary">
            {phrases.length > 0 ? Math.round((learnedCount / phrases.length) * 100) : 0}%
          </span>
        </div>
        <ProgressBar current={learnedCount} total={phrases.length} width="100%" />
        <div className="mt-2 text-center text-sm text-gray-400">
          {learnedCount} / {phrases.length} phrases learned
        </div>
      </div>
    </div>
  );
}
