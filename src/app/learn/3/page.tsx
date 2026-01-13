// Level: Numbers

"use client";

const level_id = 'numbers';
console.log(level_id);

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import 'swiper/css';

import { NumberItem, PendingNumberAction } from '@/types';
// import { shuffleArray } from '@/utils/shuffle-array';
import FlashcardNumber from '@/components/FlashcardNumber/FlashcardNumber';
import ConfirmationDialog from '@/components/ConfirmationDialog';
// import SuccessModal from '@/components/SuccessModal';
import ProgressBar from '@/components/ProgressBar/ProgressBar';


import Image from 'next/image';
import Link from 'next/link';
import { collection, doc, getDocs, setDoc, getDoc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';
import LevelNavbar from '@/components/LevelNavbar';

function NumbersProgressCard({
  course,
  total,
  onLoading,
  onLoaded,
}: {
  course: { title: string; description: string; icon: string };
  total: number;
  onLoading: () => void;
  onLoaded: (learnedIds: number[]) => void;
}) {
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      onLoading();
      setLearnedCount(0);

      try {
        const user = auth.currentUser;
        if (!user) {
          if (!cancelled) onLoaded([]);
          return;
        }

        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const progressSnap = await getDoc(progressRef);

        if (cancelled) return;

        const learnedItemIds: string[] = progressSnap.exists()
          ? (((progressSnap.data() as any).learnedItemIds as string[]) || [])
          : [];
        const learnedIds = learnedItemIds.map((id) => parseInt(id));

        setLearnedCount(learnedIds.length);
        onLoaded(learnedIds);
      } catch (e) {
        console.error('❌ Error loading user progress:', e);
        if (!cancelled) {
          setLearnedCount(0);
          onLoaded([]);
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
            {total > 0 ? Math.round((learnedCount / total) * 100) : 0}%
          </span>
        </div>
        <ProgressBar current={learnedCount} total={total} width="100%" />
        <div className="mt-2 text-center text-sm text-gray-400">
          {learnedCount} / {total} numbers learned
        </div>
      </div>
    </div>
  );
}

export default function NumbersLevel() {


  // State for numbers data fetching
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [numbersLoading, setNumbersLoading] = useState<boolean>(true);
  const [numbersError, setNumbersError] = useState<string | null>(null);

  const [learnedNumbers, setLearnedNumbers] = useState<number[]>([]); // Store numbers that the viewers has seen during the gameplay
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedNumbers, setProcessedNumbers] = useState<number[]>([]);
  const [numbersToReview, setNumbersToReview] = useState<NumberItem[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<{ numberId: number } | null>(null);

  const [courseInfo, setCourseInfo] = useState<{title: string, description: string, icon: string} | null>(null);

  // Fetch course info
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const courseRef = doc(db, 'courses', String(level_id));
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseInfo({
            title: data.title || 'Numbers',
            description: data.description || 'Learn to count in Georgian',
            icon: data.icon || '/images/icon-numbers.svg'
          });
        } else {
           setCourseInfo({
            title: 'Numbers',
            description: 'Learn to count in Georgian',
            icon: '/images/icon-numbers.svg'
          });
        }
      } catch (e) {
        console.error('Error fetching course info:', e);
         setCourseInfo({
            title: 'Numbers',
            description: 'Learn to count in Georgian',
            icon: '/images/icon-numbers.svg'
          });
      }
    };
    fetchCourseInfo();
  }, []);

  // const isHydrated = useStoreHydration();

  // Fetch numbers data from Firebase
  useEffect(() => {
    const fetchNumbersData = async () => {
      try {
        setNumbersLoading(true);
        setNumbersError(null);

        const itemsRef = collection(db, 'courses', String(level_id), 'items');
        const qItems = query(itemsRef);
        const snapshot = await getDocs(qItems);
        const numberItems: NumberItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          number: (docSnap.data() as any).number,
          translation: (docSnap.data() as any).translation,
          translationLatin: (docSnap.data() as any).translationLatin
        })).sort((a, b) => a.id - b.id);
        setNumbers(numberItems);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching numbers data:', error);
        setNumbersError(errorMessage);
      } finally {
        setNumbersLoading(false);
      }
    };

    fetchNumbersData();
  }, []);

  const handleProgressLoading = () => {
    setProgressLoaded(false);
    setLearnedNumbers([]);
  };

  const handleProgressLoaded = (learnedIds: number[]) => {
    setLearnedNumbers(learnedIds);
    setProgressLoaded(true);
  };

  // Check if all cards have been reviewed - moved to top level to avoid hooks order issues
  useEffect(() => {
    if (numbersToReview.length > 0 && processedNumbers.length === numbersToReview.length) {
      setAllCardsReviewed(true);
    }
  }, [processedNumbers, numbersToReview]);

  useEffect(() => {
    if (allCardsReviewed) {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const snap = await getDoc(progressRef);
          const learnedItemIds: string[] = snap.exists() ? ((snap.data() as any).learnedItemIds || []) : [];
          const totalItems = numbers.length;
          if (totalItems > 0 && learnedItemIds.length >= totalItems) {
            await setDoc(
              progressRef,
              {
                userId: user.uid,
                courseId: String(level_id),
                isFinished: true,
                lastUpdated: serverTimestamp(),
                createdAt: snap.exists() ? ((snap.data() as any).createdAt || serverTimestamp()) : serverTimestamp()
              },
              { merge: true }
            );
          }
        } catch (e) {
          console.error('❌ Error marking level finished:', e);
        }
      })();
    }
  }, [allCardsReviewed, numbers.length]);

  // Show loading state
  if (numbersLoading) {
    return (
      <div className="fullscreen-center">Loading...</div>
    );
  }

  // Show error state
  if (numbersError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100svh',
        flexDirection: 'column'
      }}>
        <p>Error loading numbers: {numbersError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Show empty state
  if (numbers.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100svh',
        flexDirection: 'column'
      }}>
        <p>No numbers data found. Please check the manual data entry guide.</p>
        <Link href="/learn">Go back to home</Link>
      </div>
    );
  }

  /**
   * Initializes the gameplay session with flashcards
   * This function:
   * 1. Loads the user's progress from localStorage
   * 2. Filters out already learned numbers
   * 3. Randomly selects numbers for the current session
   * 4. Sets up the UI for the learning experience
   */
  const startGameplay = () => {
    const learnedNumbersInFirebase = learnedNumbers;
    const unlearnedNumbers = numbers.filter((number: any) => !learnedNumbersInFirebase.includes(number.id)) as NumberItem[];

    // Reset session state
    setProcessedNumbers([]);

    // No need to shuffle numbers, they should be learned in order
    // Limit to 10 numbers per session for better learning experience
    const selectedNumbers = unlearnedNumbers.slice(0, 10);

    // Update state to start the gameplay
    setNumbersToReview(selectedNumbers);
    setIsGameplayActive(true);
  };



  /**
   * Persists a learned number to the progress store to maintain user progress across sessions
   * This function is called when a user confirms they've learned a number
   * @param numberId - The ID of the number to save as learned
   */
  const saveItemAsLearned = (numberId: number) => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const snap = await getDoc(progressRef);
        const current = snap.exists() ? (snap.data() as any) : null;
        const currentIds: string[] = current?.learnedItemIds || [];
        if (currentIds.includes(String(numberId))) return;
        const updatedIds = [...currentIds, String(numberId)];

        // Check if level is finished
        const isFinished = numbers.length > 0 && updatedIds.length >= numbers.length;

        await setDoc(progressRef, {
          userId: user.uid,
          courseId: String(level_id),
          learnedItemIds: updatedIds,
          isFinished: isFinished, // Explicitly save isFinished status
          lastUpdated: serverTimestamp(),
          createdAt: current?.createdAt || serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error('❌ Error saving learned number:', e);
      }
    })();
  };

  /**
   * Marks a number as "to review" and advances to the next card
   * This function is called when the user clicks "Next card" without marking it as learned
   * @param numberId - The ID of the number to mark as reviewed
   */
  const markAsToReview = (numberId: number) => {
    if (!processedNumbers.includes(numberId)) {
      setTimeout(() => {
        setProcessedNumbers((prevProcessedNumbers) => [...prevProcessedNumbers, numberId]);
        swiperInstance?.slideNext();
      }, 250); // Small delay for better user experience
    }
  };

  /**
   * Initiates the process of marking a number as learned
   * Shows a confirmation dialog before actually marking it as learned
   * This is called when the user clicks "Mark as learned" button
   * @param numberId - The ID of the number to mark as learned
   */
  const markAsLearned = (numberId: number) => {
    if (!processedNumbers.includes(numberId)) {
      // Store the action details to be executed after confirmation
      setPendingLearnedAction({ numberId });
      // Show confirmation dialog
      setShowConfirmation(true);
    }
  };

  /**
   * Handles the confirmation of marking a number as learned
   * This is executed when the user confirms in the dialog
   * Performs multiple actions:
   * 1. Adds the number to processed numbers (for this session)
   * 2. Adds the number to learned numbers (persistent)
   * 3. Advances to the next slide
   * 4. Saves the learned status to localStorage
   */
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { numberId } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedNumbers((prev) => [...prev, numberId]); // Add to processed numbers for this session
        setLearnedNumbers((prev) => [...prev, numberId]); // Add to learned numbers list
        swiperInstance?.slideNext(); // Animate to the next slide
        saveItemAsLearned(numberId); // Persist the learned status in localStorage
      }, 450); // Delay for better user experience and to allow animation to complete
    }
    // Clean up the confirmation state
    setShowConfirmation(false);
    setPendingLearnedAction(null);
  };

  // Cancel marking as learned
  const cancelMarkAsLearned = () => {
    setShowConfirmation(false);
    setPendingLearnedAction(null);
  };

  // Reset gameplay and go back to main page
  const resetGameplay = () => {
    // Ensure intro screen mounts with 0 progress (no stale flash)
    setProgressLoaded(false);
    setLearnedNumbers([]);
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedNumbers([]);
    setNumbersToReview([]);
  };

  // Main numbers page
  if (!isGameplayActive) {
    const isFinished = numbers.length > 0 && learnedNumbers.length === numbers.length;

    return (
      <div className="app app-screen">

        <LevelNavbar
          title={courseInfo?.title ? `Learn ${courseInfo.title}` : 'Learn numbers'}
          backHref="/learn"
        />

        {courseInfo && (
          <NumbersProgressCard
            course={courseInfo}
            total={numbers.length}
            onLoading={handleProgressLoading}
            onLoaded={handleProgressLoaded}
          />
        )}

        {progressLoaded && (
          <div className="levelscreen-footer">
            {isFinished ? (
              <div className='text-center p-6 bg-green-50 rounded-xl'>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg text-green-800">Course Completed!</h3>
                <p className="text-green-600">You've learned all numbers</p>
              </div>
            ) : (
              <button onClick={startGameplay} className='btn btn-block btn-primary btn-large mb-2'>
                Start Session
              </button>
            )}
          </div>
        )}

      </div>
    )
  }

  // Gameplay component
  return (
    <div className="app app-screen">

      {!allCardsReviewed && (
        <div className="gameplay-screen">

          <div className="navbar">
            <div className="navbar-row">
              <div className="navbar-aside">
                <button onClick={resetGameplay} className='navbar-button'>
                  <X size={24} />
                </button>
              </div>
              <div className="navbar-title">
                {/* Progress bar */}
                <ProgressBar
                  current={processedNumbers.length}
                  total={numbersToReview.length}
                  width="200px"
                  height={12}
                />
              </div>
              <div className="navbar-aside"></div>
            </div>
          </div>

          <div className="gameplay-stage">
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              allowTouchMove={false}
              speed={800}
              onSwiper={(swiper) => setSwiperInstance(swiper)}
              className="w-full h-full"
            >
              {numbersToReview.map((item) => {
                const isLearned = learnedNumbers.includes(item.id);
                return (
                  <SwiperSlide key={item.id}>
                    <div className={`full-center ${isLearned ? 'gameplay-slide--learned' : 'gameplay-slide--not-learned'}`}>
                        <FlashcardNumber
                          number={item}
                          onNext={() => markAsToReview(item.id)}
                          onLearned={() => markAsLearned(item.id)}
                        />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

        </div>
      )}

      <AnimatePresence mode="wait">
        {allCardsReviewed && (
          <motion.div
            className="app app-screen"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            
            <LevelNavbar
              title={courseInfo?.title ? `Learn ${courseInfo.title}` : 'Learn numbers'}
              onBackClick={resetGameplay}
            />

            <div className="container-480">
              <div className="text-center">
                <div className='text-4xl mb-4'>🎉</div>
                <h2 className='font-semibold text-2xl mb-4'>Great work!</h2>
                <div className='text-lg'>
                  <p className='mb-2'>You completed this session!</p>
                  <p className='mb-2'>Session progress: <b>{numbersToReview.filter(num => learnedNumbers.includes(num.id)).length}</b> numbers mastered</p>
                  <p>Total progress: <b>{learnedNumbers.length}</b> / <b>{numbers.length}</b> learned</p>
                </div>
              </div>
            </div>

            <div className="levelscreen-footer">
              <button onClick={startGameplay} className='btn btn-block btn-primary mb-2'>
                Continue Learning
              </button>
              <button onClick={resetGameplay} className='btn btn-block btn-secondary'>
                Go Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Mark as Learned */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Are you sure you want to mark this number as learned?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmMarkAsLearned}
        onCancel={cancelMarkAsLearned}
      />


    </div>
  )
}
