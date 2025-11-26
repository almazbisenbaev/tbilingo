'use client';

import { useEffect, useState } from 'react';
import CourseLink from '@/components/CourseLink/CourseLink';
import CourseLinkSkeleton from '@/components/CourseLinkSkeleton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { FirebaseErrorBoundary } from '@/components/FirebaseErrorBoundary';
import Brand from '../Brand/Brand';
import { ConfirmationDialog } from '@/components/ShadcnConfirmationDialog';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Unlocks all courses for testing
const UNLOCK_ALL_COURSES_FOR_TESTING = false;

export default function LearnTab() {
  // State for course item counts
  const [alphabetCount, setAlphabetCount] = useState(0);
  const [numbersCount, setNumbersCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);
  const [phrasesAdvancedCount, setPhrasesAdvancedCount] = useState(0);
  const [businessCount, setBusinessCount] = useState(0);

  // State for learned item counts
  const [alphabetLearnedCount, setAlphabetLearnedCount] = useState(0);
  const [numbersLearnedCount, setNumbersLearnedCount] = useState(0);
  const [wordsLearnedCount, setWordsLearnedCount] = useState(0);
  const [phrasesAdvancedLearnedCount, setPhrasesAdvancedLearnedCount] = useState(0);
  const [businessLearnedCount, setBusinessLearnedCount] = useState(0);

  // Loading states
  const [alphabetLoading, setAlphabetLoading] = useState(true);
  const [numbersLoading, setNumbersLoading] = useState(true);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [phrasesAdvancedLoading, setPhrasesAdvancedLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  // State for locked course dialog
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [requiredCourseTitle, setRequiredCourseTitle] = useState<string>('');

  // Auth state
  const [user, setUser] = useState(auth.currentUser);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

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

  // Fetch user progress directly from Firebase
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) {
        setAlphabetLearnedCount(0);
        setNumbersLearnedCount(0);
        setWordsLearnedCount(0);
        setPhrasesAdvancedLearnedCount(0);
        setBusinessLearnedCount(0);
        setProgressLoading(false);
        return;
      }

      try {
        setProgressLoading(true);

        const fetchCourseProgress = async (courseId: string, setLearned: (count: number) => void) => {
          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
              const data = progressSnap.data();
              const learnedItems = data.learnedItemIds || [];
              setLearned(learnedItems.length);
            } else {
              setLearned(0);
            }
          } catch (err) {
            console.error(`Error fetching progress for course ${courseId}:`, err);
            setLearned(0);
          }
        };

        await Promise.all([
          fetchCourseProgress('1', setAlphabetLearnedCount),
          fetchCourseProgress('2', setNumbersLearnedCount),
          fetchCourseProgress('3', setWordsLearnedCount),
          fetchCourseProgress('4', setPhrasesAdvancedLearnedCount),
          fetchCourseProgress('5', setBusinessLearnedCount)
        ]);

      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchUserProgress();
  }, [user]);

  // Helper to calculate completion percentage
  const getCompletionPercentage = (learned: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((learned / total) * 100);
  };

  // Calculate completion percentages for the main courses
  const alphabetProgress = getCompletionPercentage(alphabetLearnedCount, alphabetCount);
  const numbersProgress = getCompletionPercentage(numbersLearnedCount, numbersCount);
  const wordsProgress = getCompletionPercentage(wordsLearnedCount, wordsCount);
  const phrasesAdvancedProgress = getCompletionPercentage(phrasesAdvancedLearnedCount, phrasesAdvancedCount);
  const businessProgress = getCompletionPercentage(businessLearnedCount, businessCount);

  // Check if each course is completed (or bypass if testing flag is enabled)
  const [isAlphabetCompleted, setIsAlphabetCompleted] = useState<boolean>(false);
  const [isNumbersCompleted, setIsNumbersCompleted] = useState<boolean>(false);
  const [isWordsCompleted, setIsWordsCompleted] = useState<boolean>(false);
  const [isPhrasesAdvancedCompleted, setIsPhrasesAdvancedCompleted] = useState<boolean>(false);

  // Check completion status when data is loaded
  const [flagsLoaded, setFlagsLoaded] = useState(false);

  useEffect(() => {
    const checkCompletionFlags = async () => {
      if (!user) {
        setFlagsLoaded(true);
        return;
      }

      try {
        const checkFlag = async (courseId: string, setCompleted: (val: boolean) => void) => {
          if (UNLOCK_ALL_COURSES_FOR_TESTING) {
            setCompleted(true);
            return;
          }

          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
            const snap = await getDoc(progressRef);
            if (snap.exists() && snap.data().isFinished) {
              setCompleted(true);
            } else {
              setCompleted(false);
            }
          } catch (e) {
            console.error(`Error checking flag for ${courseId}`, e);
            setCompleted(false);
          }
        };

        await Promise.all([
          checkFlag('1', setIsAlphabetCompleted),
          checkFlag('2', setIsNumbersCompleted),
          checkFlag('3', setIsWordsCompleted),
          checkFlag('4', setIsPhrasesAdvancedCompleted)
        ]);
      } catch (error) {
        console.error("Error checking completion flags", error);
      } finally {
        setFlagsLoaded(true);
      }
    };

    checkCompletionFlags();
  }, [user]);

  // Auto-fix completion flags if user has learned all items but flag is missing
  useEffect(() => {
    if (!user || !flagsLoaded) return;

    const checkAndFix = async () => {
      const fixCourse = async (
        courseId: string,
        isCompleted: boolean,
        learnedCount: number,
        totalCount: number,
        setCompletedState: (val: boolean) => void
      ) => {
        // Only fix if NOT marked completed, but we have learned all items, and total items > 0
        if (!isCompleted && totalCount > 0 && learnedCount >= totalCount) {
          console.log(`Auto-fixing completion flag for course ${courseId}`);
          try {
            const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
            await setDoc(progressRef, {
              isFinished: true,
              lastUpdated: serverTimestamp()
            }, { merge: true });
            setCompletedState(true);
          } catch (e) {
            console.error(`Error fixing course ${courseId}`, e);
          }
        }
      };

      if (!alphabetLoading) await fixCourse('1', isAlphabetCompleted, alphabetLearnedCount, alphabetCount, setIsAlphabetCompleted);
      if (!numbersLoading) await fixCourse('2', isNumbersCompleted, numbersLearnedCount, numbersCount, setIsNumbersCompleted);
      if (!wordsLoading) await fixCourse('3', isWordsCompleted, wordsLearnedCount, wordsCount, setIsWordsCompleted);
      if (!phrasesAdvancedLoading) await fixCourse('4', isPhrasesAdvancedCompleted, phrasesAdvancedLearnedCount, phrasesAdvancedCount, setIsPhrasesAdvancedCompleted);
    };

    checkAndFix();
  }, [
    user,
    flagsLoaded,
    alphabetLoading, alphabetCount, alphabetLearnedCount, isAlphabetCompleted,
    numbersLoading, numbersCount, numbersLearnedCount, isNumbersCompleted,
    wordsLoading, wordsCount, wordsLearnedCount, isWordsCompleted,
    phrasesAdvancedLoading, phrasesAdvancedCount, phrasesAdvancedLearnedCount, isPhrasesAdvancedCompleted
  ]);

  // Handler for locked course click
  const handleLockedClick = (requiredTitle: string) => {
    setRequiredCourseTitle(requiredTitle);
    setShowLockedDialog(true);
  };

  // Refresh user progress when this screen mounts and on page focus/visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // We could re-fetch here if needed, but for now simple mount fetch is enough
        // or we could trigger the fetchUserProgress effect again
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Show loading skeleton while initial data is loading
  if (alphabetLoading || (user && progressLoading)) {
    return (
      <div className="learn-content">
        <Brand />
        <div className="courses-list">
          <CourseLinkSkeleton />
          <CourseLinkSkeleton />
          <CourseLinkSkeleton />
          <CourseLinkSkeleton />
          <CourseLinkSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="learn-content">
      <Brand />

      <div className="courses-list">
        <FirebaseErrorBoundary>
          {/* Alphabet Course (Always Unlocked) */}
          <div className="course-item-wrapper">
            <CourseLink
              href="/learn/1"
              title="Alphabet"
              icon="/images/icon-alphabet.svg"
              disabled={false}
              progress={alphabetProgress}
              completedItems={alphabetLearnedCount}
              totalItems={alphabetCount}
            />
          </div>

          {/* Numbers Course (Locked until Alphabet is done) */}
          <div className="course-item-wrapper">
            <CourseLink
              href="/learn/2"
              title="Numbers"
              icon="/images/icon-numbers.svg"
              disabled={false}
              locked={!isAlphabetCompleted}
              progress={numbersProgress}
              completedItems={numbersLearnedCount}
              totalItems={numbersCount}
              // This is for a popup that tells you what you need complete first before this one
              onLockedClick={() => handleLockedClick("Learn Alphabet")}
            />
          </div>

          {/* Words & Phrases - Basic (Locked until Numbers is done) */}
          <div className="course-item-wrapper">
            <CourseLink
              href="/learn/3"
              title="Words & Phrases - Basic"
              icon="/images/icon-phrases.svg"
              disabled={false}
              locked={!isNumbersCompleted}
              progress={wordsProgress}
              completedItems={wordsLearnedCount}
              totalItems={wordsCount}
              onLockedClick={() => handleLockedClick("Learn Numbers")}
            />
          </div>

          {/* Phrases Advanced (Locked until Words is done) */}
          <div className="course-item-wrapper">
            <CourseLink
              href="/learn/4"
              title="Phrases Advanced"
              icon="/images/icon-phrases.svg"
              disabled={false}
              locked={!isWordsCompleted}
              progress={phrasesAdvancedProgress}
              completedItems={phrasesAdvancedLearnedCount}
              totalItems={phrasesAdvancedCount}
              onLockedClick={() => handleLockedClick("Words & Phrases - Basic")}
            />
          </div>

          {/* Business Georgian (Locked until Phrases Advanced is done) */}
          <div className="course-item-wrapper">
            <CourseLink
              href="/learn/5"
              title="Business Georgian"
              icon="/images/icon-phrases.svg"
              disabled={false}
              locked={!isPhrasesAdvancedCompleted}
              progress={businessProgress}
              completedItems={businessLearnedCount}
              totalItems={businessCount}
              onLockedClick={() => handleLockedClick("Phrases Advanced")}
            />
          </div>
        </FirebaseErrorBoundary>
      </div>

      <PWAInstallPrompt />

      <ConfirmationDialog
        isOpen={showLockedDialog}
        title="Course Locked"
        message={`Please complete "${requiredCourseTitle}" first to unlock this course.`}
        confirmText="Got it"
        cancelText=""
        onConfirm={() => setShowLockedDialog(false)}
        onCancel={() => setShowLockedDialog(false)}
      />
    </div>
  );
}