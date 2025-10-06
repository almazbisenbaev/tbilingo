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
  const alphabetLearnedCount = useSafeProgressStore(state => state.getLearnedCount('alphabet'));
  const numbersLearnedCount = useSafeProgressStore(state => state.getLearnedCount('numbers'));
  const wordsLearnedCount = useSafeProgressStore(state => state.getLearnedCount('words'));
  
  const getCompletionPercentage = useProgressStore(state => state.getCompletionPercentage);

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
            progress={getCompletionPercentage('alphabet', alphabetData.length)}
            completedItems={alphabetLearnedCount ?? 0}
            totalItems={alphabetData.length}
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
            progress={getCompletionPercentage('numbers', numbersData.length)}
            completedItems={numbersLearnedCount ?? 0}
            totalItems={numbersData.length}
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
            progress={getCompletionPercentage('words', wordsData.length)}
            completedItems={wordsLearnedCount ?? 0}
            totalItems={wordsData.length}
          />
        )}
      </div>
      
      <PWAInstallPrompt />

    </div>
    </FirebaseErrorBoundary>
  );
}