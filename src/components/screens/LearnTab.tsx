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
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

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
  const [isAlphabetCompleted, setIsAlphabetCompleted] = useState<boolean>(false);
  const [isNumbersCompleted, setIsNumbersCompleted] = useState<boolean>(false);
  const [isWordsCompleted, setIsWordsCompleted] = useState<boolean>(false);
  const [isPhrasesAdvancedCompleted, setIsPhrasesAdvancedCompleted] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const loadFinishFlags = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          if (mounted) {
            setIsAlphabetCompleted(false);
            setIsNumbersCompleted(false);
            setIsWordsCompleted(false);
            setIsPhrasesAdvancedCompleted(false);
          }
          return;
        }
        const ids = ['1', '2', '3', '4', '5'];
        const refs = ids.map(id => doc(db, 'users', user.uid, 'progress', id));
        const snaps = await Promise.all(refs.map(r => getDoc(r)));
        const flags = snaps.map(s => (s.exists() ? Boolean((s.data() as any).isFinished) : false));
        if (mounted) {
          setIsAlphabetCompleted(UNLOCK_ALL_COURSES_FOR_TESTING || flags[0]);
          setIsNumbersCompleted(UNLOCK_ALL_COURSES_FOR_TESTING || flags[1]);
          setIsWordsCompleted(UNLOCK_ALL_COURSES_FOR_TESTING || flags[2]);
          setIsPhrasesAdvancedCompleted(UNLOCK_ALL_COURSES_FOR_TESTING || flags[3]);
        }
      } catch {}
    };
    loadFinishFlags();
    return () => { mounted = false };
  }, [alphabetProgress, numbersProgress, wordsProgress, phrasesAdvancedProgress, businessProgress]);
  
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