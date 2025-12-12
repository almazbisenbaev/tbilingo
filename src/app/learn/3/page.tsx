// Level: Basic Words

"use client";

const level_id = 3;
console.log(level_id);

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import 'swiper/css';

import { WordItem, PendingWordAction } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import FlashcardWord from '@/components/FlashcardWord/FlashcardWord';
import ConfirmationDialog from '@/components/ConfirmationDialog';
// import SuccessModal from '@/components/SuccessModal';
import ProgressBar from '@/components/ProgressBar/ProgressBar';

import Image from 'next/image';
import Link from 'next/link';
import { collection, doc, getDocs, setDoc, getDoc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

export default function BasicWordsLevel() {


  // State for words data fetching
  const [words, setWords] = useState<WordItem[]>([]);
  const [wordsLoading, setWordsLoading] = useState<boolean>(true);
  const [wordsError, setWordsError] = useState<string | null>(null);

  const [learnedWords, setLearnedWords] = useState<number[]>([]); // Store words that the user has learned
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedWords, setProcessedWords] = useState<number[]>([]);
  const [wordsToReview, setWordsToReview] = useState<WordItem[]>([]);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<{ wordId: number } | null>(null);

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
            title: data.title || 'Basic Words',
            description: data.description || 'Essential vocabulary for daily use',
            icon: data.icon || '/images/icon-phrases.svg'
          });
        } else {
           setCourseInfo({
            title: 'Basic Words',
            description: 'Essential vocabulary for daily use',
            icon: '/images/icon-phrases.svg'
          });
        }
      } catch (e) {
        console.error('Error fetching course info:', e);
         setCourseInfo({
            title: 'Basic Words',
            description: 'Essential vocabulary for daily use',
            icon: '/images/icon-phrases.svg'
          });
      }
    };
    fetchCourseInfo();
  }, []);

  // const isHydrated = useStoreHydration();



  // Fetch words data from Firebase
  useEffect(() => {
    const fetchWordsData = async () => {
      try {
        setWordsLoading(true);
        setWordsError(null);

        const itemsRef = collection(db, 'courses', String(level_id), 'items');
        const qItems = query(itemsRef);
        const snapshot = await getDocs(qItems);
        const wordItems: WordItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          english: (docSnap.data() as any).english,
          georgian: (docSnap.data() as any).georgian,
          latin: (docSnap.data() as any).latin
        })).sort((a, b) => a.id - b.id);
        setWords(wordItems);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching words data:', error);
        setWordsError(errorMessage);
      } finally {
        setWordsLoading(false);
      }
    };

    fetchWordsData();
  }, []);

  useEffect(() => {
    if (!wordsLoading && words.length > 0) {
      const loadProgress = async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            setLearnedWords([]);
            setProgressLoaded(true);
            return;
          }
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            const data = progressSnap.data() as any;
            const learnedItemIds: string[] = data.learnedItemIds || [];
            setLearnedWords(learnedItemIds.map(id => parseInt(id)));
          } else {
            setLearnedWords([]);
          }
          setProgressLoaded(true);
        } catch (e) {
          console.error('❌ Error loading user progress:', e);
          setLearnedWords([]);
          setProgressLoaded(true);
        }
      };
      loadProgress();
    }
  }, [wordsLoading, words.length]);

  // Check if all cards have been reviewed - moved to top level to avoid hooks order issues
  useEffect(() => {
    if (wordsToReview.length > 0 && processedWords.length === wordsToReview.length) {
      setAllCardsReviewed(true);
    }
  }, [processedWords, wordsToReview]);

  useEffect(() => {
    if (allCardsReviewed) {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const snap = await getDoc(progressRef);
          const learnedItemIds: string[] = snap.exists() ? ((snap.data() as any).learnedItemIds || []) : [];
          const totalItems = words.length;
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
  }, [allCardsReviewed, words.length]);

  // Show loading state
  if (wordsLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>Loading...</div>
    );
  }

  // Show error state
  if (wordsError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100svh',
        flexDirection: 'column'
      }}>
        <p>Error loading words: {wordsError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Show empty state
  if (words.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100svh',
        flexDirection: 'column'
      }}>
        <p>No words data found. Please check the manual data entry guide.</p>
        <Link href="/learn">Go back to home</Link>
      </div>
    );
  }

  /**
   * Initializes the gameplay session with word/phrase items
   * Selects 10 random items from unlearned words
   */
  const startGameplay = () => {
    const learnedWordsInFirebase = learnedWords;
    const unlearnedWords = words.filter((word: any) => !learnedWordsInFirebase.includes(word.id)) as WordItem[];

    // Reset session state
    setProcessedWords([]);

    // Shuffle remaining words and select a subset for this session
    const shuffledWords = shuffleArray(unlearnedWords);
    // Limit to 10 words per session for better learning experience
    const selectedWords = shuffledWords.slice(0, 10);

    // Update state to start the gameplay
    setWordsToReview(selectedWords);
    setIsGameplayActive(true);
  };



  /**
   * Persists a learned word to the progress store
   * @param wordId - The ID of the word to save as learned
   */
  const saveItemAsLearned = (wordId: number) => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const snap = await getDoc(progressRef);
        const current = snap.exists() ? (snap.data() as any) : null;
        const currentIds: string[] = current?.learnedItemIds || [];
        if (currentIds.includes(String(wordId))) return;
        const updatedIds = [...currentIds, String(wordId)];

        // Check if level is finished
        const isFinished = words.length > 0 && updatedIds.length >= words.length;

        await setDoc(progressRef, {
          userId: user.uid,
          courseId: String(level_id),
          learnedItemIds: updatedIds,
          isFinished: isFinished, // Explicitly save isFinished status
          lastUpdated: serverTimestamp(),
          createdAt: current?.createdAt || serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error('❌ Error saving learned word:', e);
      }
    })();
  };

  /**
   * Marks a word as "to review" and advances to the next card
   * @param wordId - The ID of the word to mark as reviewed
   */
  const markAsToReview = (wordId: number) => {
    if (!processedWords.includes(wordId)) {
      setTimeout(() => {
        setProcessedWords((prevProcessedWords) => [...prevProcessedWords, wordId]);
        swiperInstance?.slideNext();
      }, 250);
    }
  };

  /**
   * Initiates the process of marking a word as learned
   * @param wordId - The ID of the word to mark as learned
   */
  const markAsLearned = (wordId: number) => {
    if (!processedWords.includes(wordId)) {
      setPendingLearnedAction({ wordId });
      setShowConfirmation(true);
    }
  };

  /**
   * Handles the confirmation of marking a word as learned
   */
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { wordId } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedWords((prev) => [...prev, wordId]);
        setLearnedWords((prev) => [...prev, wordId]);
        setLearnedWords((prev) => [...prev, wordId]);
        swiperInstance?.slideNext();
        saveItemAsLearned(wordId);
      }, 450);
    }
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
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedWords([]);
    setWordsToReview([]);
    const user = auth.currentUser;
    if (!user) {
      setLearnedWords([]);
      return;
    }
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const data = progressSnap.data() as any;
          const learnedItemIds: string[] = data.learnedItemIds || [];
          setLearnedWords(learnedItemIds.map(id => parseInt(id)));
        } else {
          setLearnedWords([]);
        }
      } catch (e) {
        console.error('❌ Error reloading user progress:', e);
        setLearnedWords([]);
      }
    })();
  };

  // Main words page
  if (!isGameplayActive) {
    const isFinished = words.length > 0 && learnedWords.length === words.length;

    return (
      <div className='app h-svh flex flex-col justify-between py-4'>

        <div className="navbar">
          <div className="navbar-row">
            <div className="navbar-aside">
              <Link href="/learn" className='navbar-button'>
                <Image
                  src="/images/icon-back.svg"
                  alt="Back"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
            <h1 className="navbar-title">Basic Words</h1>
            <div className="navbar-aside"></div>
          </div>
        </div>

        {progressLoaded && courseInfo && (
          <div className='max-w-full w-[480px]  mx-auto px-5 flex-1 flex flex-col justify-center items-center px-5'>
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="mb-4 relative w-24 h-24">
                 <Image 
                   src={courseInfo.icon} 
                   alt={courseInfo.title} 
                   fill
                   className="object-contain"
                 />
              </div>
              <h2 className="text-2xl font-bold mb-2">{courseInfo.title}</h2>
              <p className="text-gray-500">{courseInfo.description}</p>
            </div>

            <div className=" w-full bg-white/50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-500">Progress</span>
                <span className="text-2xl font-bold text-primary">{words.length > 0 ? Math.round((learnedWords.length / words.length) * 100) : 0}%</span>
              </div>
              <ProgressBar 
                current={learnedWords.length} 
                total={words.length} 
                width="100%" 
              />
              <div className="mt-2 text-center text-sm text-gray-400">
                {learnedWords.length} / {words.length} words learned
              </div>
            </div>
          </div>
        )}

        {progressLoaded && (
          <div className='levelscreen-footer px-5'>
            {isFinished ? (
              <div className='text-center p-6 bg-green-50 rounded-xl'>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg text-green-800">Course Completed!</h3>
                <p className="text-green-600">You've learned all basic words</p>
              </div>
            ) : (
              <button onClick={startGameplay} className='btn btn-block btn-primary btn-lg mb-2'>
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
    <div className='app h-svh flex flex-col justify-between py-4'>

      {!allCardsReviewed && (
        <div className="screen-gameplay">

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
                  current={processedWords.length}
                  total={wordsToReview.length}
                  width="200px"
                  height={12}
                />
              </div>
              <div className="navbar-aside"></div>
            </div>
          </div>

          <div className="gameplay-game">
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              allowTouchMove={false}
              speed={800}
              onSwiper={(swiper) => setSwiperInstance(swiper)}
              className="w-full h-full"
            >
              {wordsToReview.map((item) => {
                const isLearned = learnedWords.includes(item.id);
                return (
                  <SwiperSlide key={item.id}>
                    <div className={`h-full w-full flex items-center justify-center ${isLearned ? 'learned' : 'not-learned'}`}>
                        <FlashcardWord
                          word={item}
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
            className="screen-finish"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            <div className="finish-message">
              <div className='text-center text-4xl'>🙌</div>
              <h2 className='font-semibold text-2xl'>That's it for today!</h2>
              <div className='text-lg finish-message-text'>
                <p>You've looked through all the flashcards for this session. You can go back to the homepage and start again.</p>
              </div>
              <div className='finish-message-actions'>
                <button onClick={resetGameplay} className='btn btn-small btn-secondary'>Go back</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Mark as Learned */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Are you sure you want to mark this item as learned?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmMarkAsLearned}
        onCancel={cancelMarkAsLearned}
      />


    </div>
  )
}