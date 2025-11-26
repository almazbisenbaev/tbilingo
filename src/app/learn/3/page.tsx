"use client";

const course_id = 3;
console.log(course_id);

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { WordItem, PendingWordAction } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import WordsComponent from '@/components/WordsComponent/WordsComponent';
import ConfirmationDialog from '@/components/ConfirmationDialog';
// import SuccessModal from '@/components/SuccessModal';
import ProgressBar from '@/components/ProgressBar/ProgressBar';

import Image from 'next/image';
import Link from 'next/link';
import { collection, doc, getDocs, setDoc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

export default function WordsCourse() {


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
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [slideWidth, setSlideWidth] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<PendingWordAction | null>(null);

  // const isHydrated = useStoreHydration();



  // Fetch words data from Firebase
  useEffect(() => {
    const fetchWordsData = async () => {
      try {
        setWordsLoading(true);
        setWordsError(null);

        const itemsRef = collection(db, 'courses', String(course_id), 'items');
        const qItems = query(itemsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(qItems);
        const wordItems: WordItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          english: (docSnap.data() as any).english,
          georgian: (docSnap.data() as any).georgian,
          latin: (docSnap.data() as any).latin
        }));
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
          const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
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
          const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
          const snap = await getDoc(progressRef);
          const learnedItemIds: string[] = snap.exists() ? ((snap.data() as any).learnedItemIds || []) : [];
          const totalItems = words.length;
          if (totalItems > 0 && learnedItemIds.length >= totalItems) {
            await setDoc(
              progressRef,
              {
                userId: user.uid,
                courseId: String(course_id),
                isFinished: true,
                lastUpdated: serverTimestamp(),
                createdAt: snap.exists() ? ((snap.data() as any).createdAt || serverTimestamp()) : serverTimestamp()
              },
              { merge: true }
            );
          }
        } catch (e) {
          console.error('❌ Error marking course finished:', e);
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
    const learnedWordsInLocal = learnedWords;
    const wordsMissingInLocal = words.filter((word: any) => !learnedWordsInLocal.includes(word.id)) as WordItem[];

    // Reset session state
    setProcessedWords([]);
    setCurrentWordIndex(0);
    setSlideWidth(0);

    // Shuffle remaining words and select a subset for this session
    const shuffledWordsMissingInLocal = shuffleArray(wordsMissingInLocal);
    // Limit to 10 words per session for better learning experience
    const selectedWords = shuffledWordsMissingInLocal.slice(0, 10);

    // Update state to start the gameplay
    setWordsToReview(selectedWords);
    setIsGameplayActive(true);

    // Calculate slide width after component renders for proper animations
    setTimeout(() => {
      const element = document.querySelector('.slider-slide');
      if (element) {
        const slideWidth = element.getBoundingClientRect().width;
        setSlideWidth(slideWidth);
      }
    }, 200); // Short delay to ensure DOM is ready
  };

  /**
   * Handles the animation between word cards by sliding the track horizontally
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide
   */
  const switchSlide = (index: number, element: HTMLElement | null) => {
    if (!element) return;

    const slideWidth = element.getBoundingClientRect().width;
    const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;

    if (sliderTrack) {
      const currentTransform = getComputedStyle(sliderTrack).transform;
      const matrix = new window.DOMMatrix(currentTransform);
      const currentTranslateX = matrix.m41;

      sliderTrack.style.transform = `translateX(${currentTranslateX - slideWidth}px)`;
    }

    // Update current word index for progress bar
    setCurrentWordIndex(index + 1);
  }

  /**
   * Persists a learned word to the progress store
   * @param wordId - The ID of the word to save as learned
   */
  const saveWordToLocal = (wordId: number) => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
        const snap = await getDoc(progressRef);
        const current = snap.exists() ? (snap.data() as any) : null;
        const currentIds: string[] = current?.learnedItemIds || [];
        if (currentIds.includes(String(wordId))) return;
        const updatedIds = [...currentIds, String(wordId)];
        await setDoc(progressRef, {
          userId: user.uid,
          courseId: String(course_id),
          learnedItemIds: updatedIds,
          lastUpdated: serverTimestamp(),
          createdAt: current?.createdAt || serverTimestamp()
        });
      } catch (e) {
        console.error('❌ Error saving learned word:', e);
      }
    })();
  };

  /**
   * Marks a word as "to review" and advances to the next card
   * @param wordId - The ID of the word to mark as reviewed
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsToReview = (wordId: number, index: number, element: HTMLElement | null) => {
    if (!processedWords.includes(wordId)) {
      setTimeout(() => {
        setProcessedWords((prevProcessedWords) => [...prevProcessedWords, wordId]);
        switchSlide(index, element);
      }, 250);
    }
  };

  /**
   * Initiates the process of marking a word as learned
   * @param wordId - The ID of the word to mark as learned
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsLearned = (wordId: number, index: number, element: HTMLElement | null) => {
    if (!processedWords.includes(wordId)) {
      setPendingLearnedAction({ wordId, index, element });
      setShowConfirmation(true);
    }
  };

  /**
   * Handles the confirmation of marking a word as learned
   */
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { wordId, index, element } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedWords((prev) => [...prev, wordId]);
        setLearnedWords((prev) => [...prev, wordId]);
        switchSlide(index, element);
        saveWordToLocal(wordId);
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
    setCurrentWordIndex(0);
    const user = auth.currentUser;
    if (!user) {
      setLearnedWords([]);
      return;
    }
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
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
    return (
      <div className='h-svh flex flex-col justify-between py-4'>
        <div className='w-full max-w-2xl mx-auto p-4'>
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
              <h1 className="navbar-title">Words & Phrases - Basic</h1>
              <div className="navbar-aside"></div>
            </div>
          </div>
        </div>

        {progressLoaded && (
          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className='text-center'>Learned <b>{learnedWords.length}</b> out of <b>{words.length}</b> words & phrases</div>
          </div>
        )}

        <div className='w-full max-w-2xl mx-auto p-4'>
          <button onClick={startGameplay} className='btn btn-block btn-primary'>Start learning</button>
        </div>
      </div>
    )
  }

  // Gameplay component
  return (
    <div className='h-svh flex flex-col justify-between py-4'>

      {!allCardsReviewed && (
        <div className="screen-gameplay">

          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className="navbar">
              <div className="navbar-row">
                <div className="navbar-aside">
                  <button onClick={resetGameplay} className='navbar-button'>
                    <Image
                      src="/images/icon-back.svg"
                      alt="Back"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>
                <div className="navbar-title">
                  {/* Progress bar */}
                  <ProgressBar
                    current={processedWords.length}
                    total={wordsToReview.length}
                    width="200px"
                  />
                </div>
                <div className="navbar-aside"></div>
              </div>
            </div>
          </div>

          <div className="gameplay-game">
            <div className="slider">
              <div className="slider-wrapper">
                <div className="slider-track">
                  {wordsToReview.map((item, index) => {
                    const isProcessed = processedWords.includes(item.id);
                    const isLearned = learnedWords.includes(item.id);
                    return <div key={item.id}
                      className={`slider-slide ${isProcessed ? 'processed' : 'not-processed'} ${isLearned ? 'learned' : 'not-learned'}`}
                      style={{
                        '--slide-width': slideWidth + 'px',
                      } as React.CSSProperties}
                    >
                      <div className='slider-slide-inner'>

                        <WordsComponent
                          word={item}
                          onNext={() => markAsToReview(item.id, index, document.querySelectorAll('.slider-slide')[index] as HTMLElement)}
                          onLearned={() => markAsLearned(item.id, index, document.querySelectorAll('.slider-slide')[index] as HTMLElement)}
                        />

                      </div>
                    </div>;
                  })}
                </div>
              </div>
            </div>
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
              <div className='text-center text-4xl'>🎉</div>
              <h2 className='font-semibold text-2xl'>Great work!</h2>
              <div className='text-lg finish-message-text'>
                <p>You've reviewed all the words and phrases for this session. You learned <b>{learnedWords.filter(id => wordsToReview.some(word => word.id === id)).length}</b> new items!</p>
                <p>Total progress: <b>{learnedWords.length}</b> out of <b>{words.length}</b> words & phrases learned.</p>
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