'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useProgressStore, useSafeProgressStore } from '@/stores/progressStore';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import Brand from '../Brand/Brand';
import { ConfirmationDialog } from '@/components/ShadcnConfirmationDialog';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

// Unlocks all courses for testing
const UNLOCK_ALL_COURSES_FOR_TESTING = false;

export default function LearnTab() {
  const { initializeCourse } = useProgressStore();
  const loadUserProgress = useProgressStore(state => state.loadUserProgress);

  // State for course item counts
  const [alphabetCount, setAlphabetCount] = useState(0);
  const [numbersCount, setNumbersCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [phrasesAdvancedCount, setPhrasesAdvancedCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);

  // Loading states
  const [alphabetLoading, setAlphabetLoading] = useState(true);
  const [numbersLoading, setNumbersLoading] = useState(true);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [phrasesAdvancedLoading, setPhrasesAdvancedLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);

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

  // Fetch item counts directly from Firebase
  useEffect(() => {
    const fetchCourseItemCount = async (courseId: string, setCount: (count: number) => void, setLoading: (loading: boolean) => void) => {
      try {
        const itemsRef = collection(db, 'courses', courseId, 'items');
        const q = query(itemsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        setCount(snapshot.docs.length);
      } catch (error) {
        console.error(`Error fetching course ${courseId} items:`, error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Fetch all course item counts
    fetchCourseItemCount('1', setAlphabetCount, setAlphabetLoading);
    fetchCourseItemCount('2', setNumbersCount, setNumbersLoading);
    fetchCourseItemCount('3', setWordsCount, setWordsLoading);
    fetchCourseItemCount('4', setPhrasesAdvancedCount, setPhrasesAdvancedLoading);
    fetchCourseItemCount('5', setBusinessCount, setBusinessLoading);
  }, []);

  // Calculate completion percentages for the main courses
  const alphabetProgress = getCompletionPercentage('1', alphabetCount);
  const numbersProgress = getCompletionPercentage('2', numbersCount);
  const wordsProgress = getCompletionPercentage('3', wordsCount);
  const phrasesAdvancedProgress = getCompletionPercentage('4', phrasesAdvancedCount);
  const businessProgress = getCompletionPercentage('5', businessCount);

  // Check if each course is completed (or bypass if testing flag is enabled)
  const [isAlphabetCompleted, setIsAlphabetCompleted] = useState<boolean>(false);
  const [isNumbersCompleted, setIsNumbersCompleted] = useState<boolean>(false);
  const [isWordsCompleted, setIsWordsCompleted] = useState<boolean>(false);
  const [isPhrasesAdvancedCompleted, setIsPhrasesAdvancedCompleted] = useState<boolean>(false);

  const [flagsLoaded, setFlagsLoaded] = useState(false);

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
            setFlagsLoaded(true);
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
          setFlagsLoaded(true);
        }
      } catch {
        if (mounted) setFlagsLoaded(true);
      }
    };
    loadFinishFlags();
    return () => { mounted = false };
  }, [alphabetProgress, numbersProgress, wordsProgress, phrasesAdvancedProgress, businessProgress]);

  // Self-correcting logic: if user has learned all items but isFinished is false, fix it
  useEffect(() => {
    if (!flagsLoaded) return;

    const checkAndFix = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const fixCourse = async (courseId: string, isCompleted: boolean, learnedCount: number | undefined, totalItems: number, setCompletedState: (val: boolean) => void) => {
        if (learnedCount !== undefined && totalItems > 0 && learnedCount >= totalItems && !isCompleted) {
          console.log(`Auto-correcting course ${courseId} completion status`);
          try {
            await setDoc(doc(db, 'users', user.uid, 'progress', courseId), {
              isFinished: true,
              lastUpdated: serverTimestamp()
            }, { merge: true });
            setCompletedState(true);
          } catch (e) {
            console.error(`Failed to auto-correct course ${courseId}`, e);
          }
        }
      };

      if (!alphabetLoading) await fixCourse('1', isAlphabetCompleted, alphabetLearnedCount, alphabetCount, setIsAlphabetCompleted);
      if (!numbersLoading) await fixCourse('2', isNumbersCompleted, numbersLearnedCount, numbersCount, setIsNumbersCompleted);
      if (!wordsLoading) await fixCourse('3', isWordsCompleted, wordsLearnedCount, wordsCount, setIsWordsCompleted);
      if (!phrasesAdvancedLoading) await fixCourse('4', isPhrasesAdvancedCompleted, phrasesAdvancedLearnedCount, phrasesAdvancedCount, setIsPhrasesAdvancedCompleted);
      // Business course (5) doesn't seem to unlock anything else, but we can fix it too if needed. 
      // The state isPhrasesAdvancedCompleted controls Business lock. 
      // There is no isBusinessCompleted state used for locking anything, but we might want to fix the flag anyway.
    };

    checkAndFix();
  }, [
    flagsLoaded,
    alphabetLoading, alphabetCount, alphabetLearnedCount, isAlphabetCompleted,
    numbersLoading, numbersCount, numbersLearnedCount, isNumbersCompleted,
    wordsLoading, wordsCount, wordsLearnedCount, isWordsCompleted,
    phrasesAdvancedLoading, phrasesAdvancedCount, phrasesAdvancedLearnedCount, isPhrasesAdvancedCompleted
  ]);

  // Handler for locked course click
  const handleLockedClick = (courseTitle: string) => {
    setRequiredCourseTitle(courseTitle);
    setShowLockedDialog(true);
  };

  // Initialize courses with their total item counts when data is loaded
  useEffect(() => {
    if (!alphabetLoading && alphabetCount > 0) {
      initializeCourse('1', alphabetCount);
    }
  }, [alphabetLoading, alphabetCount, initializeCourse]);

  useEffect(() => {
    if (!numbersLoading && numbersCount > 0) {
      initializeCourse('2', numbersCount);
    }
  }, [numbersLoading, numbersCount, initializeCourse]);

  useEffect(() => {
    if (!wordsLoading && wordsCount > 0) {
      initializeCourse('3', wordsCount);
    }
  }, [wordsLoading, wordsCount, initializeCourse]);

  // Initialize phrase courses (using old slugs for progress)
  useEffect(() => {
    if (!phrasesAdvancedLoading && phrasesAdvancedCount > 0) {
      initializeCourse('4', phrasesAdvancedCount);
    }
  }, [phrasesAdvancedLoading, phrasesAdvancedCount, initializeCourse]);

  useEffect(() => {
    if (!businessLoading && businessCount > 0) {
      initializeCourse('5', businessCount);
    }
  }, [businessLoading, businessCount, initializeCourse]);

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
              totalItems={alphabetCount}
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
              totalItems={numbersCount}
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
              totalItems={wordsCount}
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
              totalItems={phrasesAdvancedCount}
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
              totalItems={businessCount}
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