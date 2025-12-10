// Level: Alphabet

"use client";

const level_id = 1;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { AlphabetItem } from '@/types';

import { shuffleArray } from '@/utils/shuffle-array';

import Image from 'next/image';
import Link from 'next/link';

import FlashcardLetter from '@/components/FlashcardLetter/FlashcardLetter';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import ProgressBar from '@/components/ProgressBar/ProgressBar';


import { collection, doc, getDocs, setDoc, getDoc, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

export default function AlphabetLevel() {

  // State for alphabet data fetching
  const [allAlphabetItems, setAllAlphabetItems] = useState<AlphabetItem[]>([]);
  const [alphabetLoading, setAlphabetLoading] = useState<boolean>(true);
  const [alphabetError, setAlphabetError] = useState<string | null>(null);

  const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen during the gameplay
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedCharacters, setProcessedCharacters] = useState<number[]>([]);
  const [charactersToReview, setCharactersToReview] = useState<AlphabetItem[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<{ characterId: number, index: number, element: HTMLElement | null } | null>(null);

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
            title: data.title || 'Alphabet',
            description: data.description || 'Master the Georgian script',
            icon: data.icon || '/images/icon-alphabet.svg'
          });
        } else {
           setCourseInfo({
            title: 'Alphabet',
            description: 'Master the Georgian script',
            icon: '/images/icon-alphabet.svg'
          });
        }
      } catch (e) {
        console.error('Error fetching course info:', e);
         setCourseInfo({
            title: 'Alphabet',
            description: 'Master the Georgian script',
            icon: '/images/icon-alphabet.svg'
          });
      }
    };
    fetchCourseInfo();
  }, []);


  // const isHydrated = useStoreHydration();

  // Fetch alphabet data from Firebase
  useEffect(() => {
    const fetchAlphabetData = async () => {
      try {
        setAlphabetLoading(true);
        setAlphabetError(null);
        const itemsRef = collection(db, 'courses', String(level_id), 'items');
        const qItems = query(itemsRef);
        const snapshot = await getDocs(qItems);
        const alphabetItems: AlphabetItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          character: (docSnap.data() as any).character,
          name: (docSnap.data() as any).name,
          pronunciation: (docSnap.data() as any).pronunciation,
          audioUrl: (docSnap.data() as any).audioUrl || ''
        })).sort((a, b) => a.id - b.id);
        setAllAlphabetItems(alphabetItems);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching alphabet data:', error);
        setAlphabetError(errorMessage);
      } finally {
        setAlphabetLoading(false);
      }
    };

    fetchAlphabetData();
  }, []);

  // Check if all cards have been reviewed
  useEffect(() => {
    if (charactersToReview.length > 0 && processedCharacters.length === charactersToReview.length) {
      setAllCardsReviewed(true);
    }
  }, [processedCharacters, charactersToReview]);

  useEffect(() => {
    if (allCardsReviewed) {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          // Use local state to check for completion instead of fetching to avoid race conditions
          const totalItems = allAlphabetItems.length;
          const isFinished = totalItems > 0 && learnedCharacters.length >= totalItems;

          if (isFinished) {
            const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
            await setDoc(
              progressRef,
              {
                userId: user.uid,
                courseId: String(level_id),
                isFinished: true,
                lastUpdated: serverTimestamp(),
                // We don't need to fetch createdAt, if it doesn't exist setDoc with merge will handle it or we can just omit if we want to be safe about not overwriting. 
                // But here we just want to ensure isFinished is true.
              },
              { merge: true }
            );
          }
        } catch (e) {
          console.error('❌ Error marking level finished:', e);
        }
      })();
    }
  }, [allCardsReviewed, allAlphabetItems.length, learnedCharacters.length]);

  useEffect(() => {
    // Initialize level when alphabet data is loaded
    if (!alphabetLoading && allAlphabetItems.length > 0) {
      const loadProgress = async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            setLearnedCharacters([]);
            setProgressLoaded(true);
            return;
          }
          const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            const data = progressSnap.data() as any;
            const learnedItemIds: string[] = data.learnedItemIds || [];
            setLearnedCharacters(learnedItemIds.map(id => parseInt(id)));
          } else {
            setLearnedCharacters([]);
          }
          setProgressLoaded(true);
        } catch (e) {
          console.error('❌ Error loading user progress:', e);
          setLearnedCharacters([]);
          setProgressLoaded(true);
        }
      };
      loadProgress();
    }
  }, [alphabetLoading, allAlphabetItems.length]);

  // Show loading state
  if (alphabetLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>Loading...</div>
    );
  }

  // Show error state
  if (alphabetError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100svh',
        flexDirection: 'column'
      }}>
        <p>Error loading alphabet: {alphabetError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Show empty state
  if (allAlphabetItems.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100dvh',
        flexDirection: 'column'
      }}>
        <p>No alphabet data found. Please check the manual data entry guide.</p>
        <Link href="/learn">Go back to home</Link>
      </div>
    );
  }

  /**
   * Initializes the gameplay session with flashcards
   * This function:
   * 1. Loads the user's progress from firestore
   * 2. Filters out already learned characters
   * 3. Randomly selects characters for the current session
   * 4. Sets up the UI for the learning experience
   */
  const startGameplay = () => {
    const learnedCharactersInFirebase = learnedCharacters;
    const unlearnedCharacters = allAlphabetItems.filter((letter: any) => !learnedCharactersInFirebase.includes(letter.id)) as AlphabetItem[];

    // Reset session state
    setProcessedCharacters([]);
    setSlideWidth(0);

    // Shuffle remaining characters and select a subset for this session
    const shuffledUnlearnedCharacters = shuffleArray(unlearnedCharacters);
    // Limit to 10 characters per session for better learning experience
    const selectedCharacters = shuffledUnlearnedCharacters.slice(0, 10);

    // Update state to start the gameplay
    setCharactersToReview(selectedCharacters);
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
   * Handles the animation between flashcards by sliding the track horizontally
   * Uses CSS transform to create a smooth sliding animation
   * @param index - The index of the current slide (not used but kept for API consistency)
   * @param element - The DOM element of the current slide
   */
  const switchSlide = (index: number, element: HTMLElement | null) => {
    if (!element) return; // Safety check if element doesn't exist

    // Get the width of the current slide for accurate movement
    const slideWidth = element.getBoundingClientRect().width;

    // Find the slider track element that contains all slides
    const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;

    if (sliderTrack) {
      // Extract the current transform matrix to get the current position
      const currentTransform = getComputedStyle(sliderTrack).transform;
      const matrix = new window.DOMMatrix(currentTransform);
      const currentTranslateX = matrix.m41; // m41 is the translateX value in the matrix

      // Move the track left by the width of one slide to show the next card
      // The negative value moves the track to the left
      sliderTrack.style.transform = `translateX(${currentTranslateX - slideWidth}px)`;
    }
  }

  /**
   * Persists a learned letter to the progress store to maintain user progress across sessions
   * This function is called when a user confirms they've learned a character
   * @param characterId - The ID of the character to save as learned
   */
  const saveItemAsLearned = (characterId: number) => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const snap = await getDoc(progressRef);
        const current = snap.exists() ? (snap.data() as any) : null;
        const currentIds: string[] = current?.learnedItemIds || [];

        if (currentIds.includes(String(characterId))) return;

        const updatedIds = [...currentIds, String(characterId)];

        // Check if level is finished
        const isFinished = allAlphabetItems.length > 0 && updatedIds.length >= allAlphabetItems.length;

        await setDoc(progressRef, {
          userId: user.uid,
          courseId: String(level_id),
          learnedItemIds: updatedIds,
          isFinished: isFinished, // Explicitly save isFinished status
          lastUpdated: serverTimestamp(),
          createdAt: current?.createdAt || serverTimestamp()
        }, { merge: true }); // Use merge to prevent overwriting other fields
      } catch (e) {
        console.error('❌ Error saving learned item:', e);
      }
    })();
  };

  /**
   * Marks a character as "to review" and advances to the next card
   * This function is called when the user clicks "Next card" without marking it as learned
   * @param characterId - The ID of the character to mark as reviewed
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsToReview = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      setTimeout(() => {
        setProcessedCharacters((prevProcessedCharacters) => [...prevProcessedCharacters, characterId]);
        switchSlide(index, element);
      }, 250); // Small delay for better user experience
    }
  };

  /**
   * Initiates the process of marking a character as learned
   * Shows a confirmation dialog before actually marking it as learned
   * This is called when the user clicks "Mark as learned" button
   * @param characterId - The ID of the character to mark as learned
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsLearned = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      // Store the action details to be executed after confirmation
      setPendingLearnedAction({ characterId, index, element });
      // Show confirmation dialog
      setShowConfirmation(true);
    }
  };

  /**
   * Handles the confirmation of marking a character as learned
   * This is executed when the user confirms in the dialog
   * Performs multiple actions:
   * 1. Adds the character to processed characters (for this session)
   * 2. Adds the character to learned characters (persistent)
   * 3. Advances to the next slide
   * 4. Saves the learned item in user's firestore
   */
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { characterId, index, element } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedCharacters((prev) => [...prev, characterId]); // Add to processed characters for this session
        setLearnedCharacters((prev) => [...prev, characterId]); // Add to learned characters list
        switchSlide(index, element); // Animate to the next slide
        saveItemAsLearned(characterId); // Persist the learned status in user's firestore
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
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedCharacters([]);
    setCharactersToReview([]);
    const user = auth.currentUser;
    if (!user) {
      setLearnedCharacters([]);
      return;
    }
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(level_id));
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const data = progressSnap.data() as any;
          const learnedItemIds: string[] = data.learnedItemIds || [];
          setLearnedCharacters(learnedItemIds.map(id => parseInt(id)));
        } else {
          setLearnedCharacters([]);
        }
      } catch (e) {
        console.error('❌ Error reloading user progress:', e);
        setLearnedCharacters([]);
      }
    })();
  };

  // Main alphabet page
  if (!isGameplayActive) {
    const isFinished = allAlphabetItems.length > 0 && learnedCharacters.length === allAlphabetItems.length;

    return (
      <div className='h-svh flex flex-col justify-between py-4'>

        <div className='w-full max-w-[480px] mx-auto'>
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
              <h1 className="navbar-title">Learn alphabet</h1>
              <div className="navbar-aside"></div>
            </div>
          </div>
        </div>

        {progressLoaded && courseInfo && (
          <div className='w-full max-w-[480px] mx-auto flex-1 flex flex-col justify-center items-center'>
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
                <span className="text-2xl font-bold text-primary">{allAlphabetItems.length > 0 ? Math.round((learnedCharacters.length / allAlphabetItems.length) * 100) : 0}%</span>
              </div>
              <ProgressBar 
                current={learnedCharacters.length} 
                total={allAlphabetItems.length} 
                width="100%" 
              />
              <div className="mt-2 text-center text-sm text-gray-400">
                {learnedCharacters.length} / {allAlphabetItems.length} characters learned
              </div>
            </div>
          </div>
        )}

        {progressLoaded && (
          <div className='w-full max-w-[480px] mx-auto'>
            {isFinished ? (
              <div className='text-center p-6 bg-green-50 rounded-xl'>
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg text-green-800">Course Completed!</h3>
                <p className="text-green-600">You've learned the whole alphabet</p>
              </div>
            ) : (
              <button onClick={startGameplay} className='btn btn-block btn-primary btn-lg shadow-lg shadow-primary/20'>
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
    <div className='h-svh flex flex-col justify-between py-4'>

      {!allCardsReviewed && (
        <div className={`screen-gameplay`}>

          <div className='w-full max-w-[480px] mx-auto'>
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
                    current={processedCharacters.length}
                    total={charactersToReview.length}
                    width="200px"
                    height={12}
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
                  {charactersToReview.map((item, index) => {
                    const isProcessed = processedCharacters.includes(item.id);
                    const isLearned = learnedCharacters.includes(item.id);
                    return <div key={item.id}
                      className={`slider-slide ${isProcessed ? 'processed' : 'not-processed'} ${isLearned ? 'learned' : 'not-learned'}`}
                      style={{
                        '--slide-width': slideWidth + 'px',
                      } as React.CSSProperties}
                    >
                      <div className='slider-slide-inner'>

                        <FlashcardLetter
                          letter={item}
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
        title="Are you sure you want to mark this character as learned?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmMarkAsLearned}
        onCancel={cancelMarkAsLearned}
      />


    </div>
  )
}
