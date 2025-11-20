'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore } from '@/stores/progressStore';
import { useAlphabet, useNumbers, useWords, usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import Brand from '../Brand/Brand';
import { ConfirmationDialog } from '@/components/ShadcnConfirmationDialog';
import { isCourseCompleted } from '@/utils/course-unlock-utils';

// Unlocks all courses for testing
const UNLOCK_ALL_COURSES_FOR_TESTING = false;

export default function LearnTab() {
  const { initializeCourse } = useProgressStore();
  const loadUserProgress = useProgressStore(state => state.loadUserProgress);
  
  // Fetch learning data from Firebase
  const { items: alphabetData, loading: alphabetLoading } = useAlphabet();
  const { items: numbersData, loading: numbersLoading } = useNumbers();
  const { items: wordsData, loading: wordsLoading } = useWords();
  
  // Fetch phrase courses data
  const { items: phrasesAdvancedData, loading: phrasesAdvancedLoading } = usePhrasesCourse('4');
  const { items: businessData, loading: businessLoading } = usePhrasesCourse('5');
  
  // State for locked course dialog
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [requiredCourseTitle, setRequiredCourseTitle] = useState<string>('');

  

  // Use safe progress store hooks that return undefined during SSR  
  const alphabetLearnedCount = useSafeProgressStore(state => state.getLearnedCount('1'));
  const numbersLearnedCount = useSafeProgressStore(state => state.getLearnedCount('2'));
  const wordsLearnedCount = useSafeProgressStore(state => state.getLearnedCount('3'));
  
  // Phrase courses learned counts (using old slugs for progress tracking)
  const phrasesAdvancedLearnedCount = useSafeProgressStore(state => state.getLearnedCount('4'));
  const businessLearnedCount = useSafeProgressStore(state => state.getLearnedCount('5'));
  
  const getCompletionPercentage = useProgressStore(state => state.getCompletionPercentage);
  
  // Calculate completion percentages for the main courses
  const alphabetProgress = getCompletionPercentage('1', alphabetData.length);
  const numbersProgress = getCompletionPercentage('2', numbersData.length);
  const wordsProgress = getCompletionPercentage('3', wordsData.length);
  const phrasesAdvancedProgress = getCompletionPercentage('4', phrasesAdvancedData.length);
  const businessProgress = getCompletionPercentage('5', businessData.length);
  
  // Check if each course is completed (or bypass if testing flag is enabled)
  const isAlphabetCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(alphabetProgress);
  const isNumbersCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(numbersProgress);
  const isWordsCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(wordsProgress);
  const isPhrasesAdvancedCompleted = UNLOCK_ALL_COURSES_FOR_TESTING || isCourseCompleted(phrasesAdvancedProgress);
  
  // Handler for locked course click
  const handleLockedClick = (courseTitle: string) => {
    setRequiredCourseTitle(courseTitle);
    setShowLockedDialog(true);
  };

  // Initialize courses with their total item counts when data is loaded
  useEffect(() => {
    if (!alphabetLoading && alphabetData.length > 0) {
      initializeCourse('1', alphabetData.length);
    }
  }, [alphabetLoading, alphabetData.length, initializeCourse]);
  
  useEffect(() => {
    if (!numbersLoading && numbersData.length > 0) {
      initializeCourse('2', numbersData.length);
    }
  }, [numbersLoading, numbersData.length, initializeCourse]);
  
  useEffect(() => {
    if (!wordsLoading && wordsData.length > 0) {
      initializeCourse('3', wordsData.length);
    }
  }, [wordsLoading, wordsData.length, initializeCourse]);
  
  // Initialize phrase courses (using old slugs for progress)
  useEffect(() => {
    if (!phrasesAdvancedLoading && phrasesAdvancedData.length > 0) {
      initializeCourse('4', phrasesAdvancedData.length);
    }
  }, [phrasesAdvancedLoading, phrasesAdvancedData.length, initializeCourse]);
  
  useEffect(() => {
    if (!businessLoading && businessData.length > 0) {
      initializeCourse('5', businessData.length);
    }
  }, [businessLoading, businessData.length, initializeCourse]);
  
  // Refresh user progress when this screen mounts and on page focus/visibility
  useEffect(() => {
    loadUserProgress();
    const onFocus = () => loadUserProgress();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserProgress();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [loadUserProgress]);


  return (
    <FirebaseErrorBoundary>
      <div className="learn-content">

      <div className="welcome-header">
        <Brand />
      </div>

      <div className="welcome-actions">

        {/* Alphabet Course - Always unlocked */}
        {alphabetLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/1"
            title="Alphabet"
            icon="/images/icon-alphabet.svg"
            disabled={false}
            progress={alphabetProgress}
            completedItems={alphabetLearnedCount ?? 0}
            totalItems={alphabetData.length}
          />
        )}
        
        {/* Numbers Course - Unlocked after alphabet */}
        {numbersLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/2"
            title="Numbers"
            icon="/images/icon-numbers.svg"
            disabled={false}
            locked={!isAlphabetCompleted}
            progress={numbersProgress}
            completedItems={numbersLearnedCount ?? 0}
            totalItems={numbersData.length}
            // This is for a popup that tells you what you need complete first before this one
            onLockedClick={() => handleLockedClick("Learn Alphabet")}
          />
        )}
        
        {/* Words/Phrases Course - Unlocked after numbers */}
        {wordsLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/3"
            title="Words & Phrases - Basic"
            icon="/images/icon-phrases.svg"
            disabled={false}
            locked={!isNumbersCompleted}
            progress={wordsProgress}
            completedItems={wordsLearnedCount ?? 0}
            totalItems={wordsData.length}
            onLockedClick={() => handleLockedClick("Learn Numbers")}
          />
        )}
        
        {/* Phrases Advanced Course - Unlocked after words */}
        {phrasesAdvancedLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/4"
            title="Phrases Advanced"
            icon="/images/icon-phrases.svg"
            disabled={false}
            locked={!isWordsCompleted}
            progress={phrasesAdvancedProgress}
            completedItems={phrasesAdvancedLearnedCount ?? 0}
            totalItems={phrasesAdvancedData.length}
            onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
          />
        )}
        
        {/* Business Georgian Course - Unlocked after phrases advanced */}
        {businessLoading ? (
          <CourseLinkSkeleton />
        ) : (
          <CourseLink 
            href="/learn/5"
            title="Business Georgian"
            icon="/images/icon-phrases.svg"
            disabled={false}
            locked={!isPhrasesAdvancedCompleted}
            progress={businessProgress}
            completedItems={businessLearnedCount ?? 0}
            totalItems={businessData.length}
            onLockedClick={() => handleLockedClick("Phrases Advanced")}
          />
        )}

      </div>
      
      {/* Locked Course Dialog */}
      <ConfirmationDialog
        isOpen={showLockedDialog}
        title={`Complete "${requiredCourseTitle}" first to unlock this course.`}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowLockedDialog(false)}
        onCancel={() => setShowLockedDialog(false)}
      />
      
      <PWAInstallPrompt />

    </div>
    </FirebaseErrorBoundary>
  );
}