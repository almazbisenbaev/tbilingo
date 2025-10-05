'use client';

import { useEffect } from 'react';
import CourseLink from '@/components/CourseLink';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore, useStoreHydration } from '@/stores/progressStore';
import { alphabet } from '@/data/alphabet';
import { numbers } from '@/data/numbers';
import { words } from '@/data/words';
import Brand from './Brand/Brand';

export default function LearnTab() {
  const {
    initializeCourse
  } = useProgressStore();
  
  const isHydrated = useStoreHydration();

  // Use safe progress store hooks that return undefined during SSR
  const alphabetProgress = useSafeProgressStore(state => state.getCourseProgress('alphabet'));
  const numbersProgress = useSafeProgressStore(state => state.getCourseProgress('numbers'));
  const wordsProgress = useSafeProgressStore(state => state.getCourseProgress('words'));

  // Initialize courses with their total item counts
  useEffect(() => {
    initializeCourse('alphabet', alphabet.length);
    initializeCourse('numbers', numbers.length);
    initializeCourse('words', words.length);
  }, [initializeCourse]);

  return (
    <div className="learn-content">

      <div className="welcome-header">
        <Brand />
      </div>

      <div className="welcome-actions">
        <CourseLink 
          href="/alphabet"
          title="Learn Alphabet"
          icon="/images/icon-alphabet.svg"
          disabled={false}
          progress={alphabetProgress?.completionPercentage ?? 0}
          completedItems={alphabetProgress?.learnedItems.length ?? 0}
          totalItems={alphabetProgress?.totalItems ?? 0}
        />
        <CourseLink 
          href="/numbers"
          title="Learn Numbers"
          icon="/images/icon-numbers.svg"
          disabled={false}
          progress={numbersProgress?.completionPercentage ?? 0}
          completedItems={numbersProgress?.learnedItems.length ?? 0}
          totalItems={numbersProgress?.totalItems ?? 0}
        />
        <CourseLink 
          href="/words"
          title="Words & Phrases - Basic"
          icon="/images/icon-phrases.svg"
          disabled={false}
          progress={wordsProgress?.completionPercentage ?? 0}
          completedItems={wordsProgress?.learnedItems.length ?? 0}
          totalItems={wordsProgress?.totalItems ?? 0}
        />
      </div>
      <PWAInstallPrompt />
      <div className="welcome-footer">
        <div className="credits">Made by <a target="_blank" href="https://www.threads.com/@almazbisenbaev">Almaz Bisenbaev</a></div>
      </div>
    </div>
  );
}