'use client';

import { useEffect } from 'react';
import CourseLink from '@/components/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore, useStoreHydration } from '@/stores/progressStore';
import { useAlphabet, useNumbers, useWords } from '@/hooks/useEnhancedLearningContent';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import Brand from './Brand/Brand';

export default function LearnTab() {
  const {
    initializeCourse
  } = useProgressStore();
  
  const isHydrated = useStoreHydration();
  
  // Fetch learning data from Firebase
  const { items: alphabetData, loading: alphabetLoading } = useAlphabet();
  const { items: numbersData, loading: numbersLoading } = useNumbers();
  const { items: wordsData, loading: wordsLoading } = useWords();
  


  // Use safe progress store hooks that return undefined during SSR
  const alphabetProgress = useSafeProgressStore(state => state.getCourseProgress('alphabet'));
  const numbersProgress = useSafeProgressStore(state => state.getCourseProgress('numbers'));
  const wordsProgress = useSafeProgressStore(state => state.getCourseProgress('words'));

  // Initialize courses with their total item counts when data is loaded
  useEffect(() => {
    if (!alphabetLoading && alphabetData.length > 0) {
      initializeCourse('alphabet', alphabetData.length);
    }
  }, [alphabetLoading, alphabetData.length, initializeCourse]);
  
  useEffect(() => {
    if (!numbersLoading && numbersData.length > 0) {
      initializeCourse('numbers', numbersData.length);
    }
  }, [numbersLoading, numbersData.length, initializeCourse]);
  
  useEffect(() => {
    if (!wordsLoading && wordsData.length > 0) {
      initializeCourse('words', wordsData.length);
    }
  }, [wordsLoading, wordsData.length, initializeCourse]);


  


  return (
    <FirebaseErrorBoundary>
      <div className="learn-content">

      <div className="welcome-header">
        <Brand />
      </div>





      <div className="welcome-actions">
        {/* Alphabet Course */}
        {alphabetLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/alphabet"
            title="Learn Alphabet"
            icon="/images/icon-alphabet.svg"
            disabled={alphabetData.length === 0}
            progress={alphabetProgress?.completionPercentage ?? 0}
            completedItems={alphabetProgress?.learnedItems.length ?? 0}
            totalItems={alphabetProgress?.totalItems ?? alphabetData.length}
          />
        )}
        
        {/* Numbers Course */}
        {numbersLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/numbers"
            title="Learn Numbers"
            icon="/images/icon-numbers.svg"
            disabled={numbersData.length === 0}
            progress={numbersProgress?.completionPercentage ?? 0}
            completedItems={numbersProgress?.learnedItems.length ?? 0}
            totalItems={numbersProgress?.totalItems ?? numbersData.length}
          />
        )}
        
        {/* Words/Phrases Course */}
        {wordsLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/words"
            title="Words & Phrases - Basic"
            icon="/images/icon-phrases.svg"
            disabled={wordsData.length === 0}
            progress={wordsProgress?.completionPercentage ?? 0}
            completedItems={wordsProgress?.learnedItems.length ?? 0}
            totalItems={wordsProgress?.totalItems ?? wordsData.length}
          />
        )}
      </div>
      
      <PWAInstallPrompt />

    </div>
    </FirebaseErrorBoundary>
  );
}