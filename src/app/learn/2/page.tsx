"use client";

const course_id = 2;
console.log(course_id);

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { NumberItem, PendingNumberAction } from '@/types';
import FlashcardNumber from '@/components/FlashcardNumber/FlashcardNumber';
import ConfirmationDialog from '@/components/ShadcnConfirmationDialog';
// import SuccessModal from '@/components/ShadcnSuccessModal';
import CoursePageLoading from '@/components/CoursePageLoading';
 

import Image from 'next/image';
import Link from 'next/link';
import { collection, doc, getDocs, setDoc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@root/firebaseConfig';

export default function NumbersCourse() {
  useBackToHomeNavigation();

  // State for numbers data fetching
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [numbersLoading, setNumbersLoading] = useState<boolean>(true);
  const [numbersError, setNumbersError] = useState<string | null>(null);

  const [learnedNumbers, setLearnedNumbers] = useState<number[]>([]); // Store numbers that the viewers has seen during the gameplay
  
  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedNumbers, setProcessedNumbers] = useState<number[]>([]); 
  const [numbersToReview, setNumbersToReview] = useState<NumberItem[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<PendingNumberAction | null>(null);

  // const isHydrated = useStoreHydration();

  // Fetch numbers data from Firebase
  useEffect(() => {
    const fetchNumbersData = async () => {
      try {
        setNumbersLoading(true);
        setNumbersError(null);
        
        const itemsRef = collection(db, 'courses', String(course_id), 'items');
        const qItems = query(itemsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(qItems);
        const numberItems: NumberItem[] = snapshot.docs.map(docSnap => ({
          id: typeof docSnap.id === 'string' ? parseInt(docSnap.id) : (docSnap.id as unknown as number),
          number: (docSnap.data() as any).number,
          translation: (docSnap.data() as any).translation,
          translationLatin: (docSnap.data() as any).translationLatin
        }));
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

  useEffect(() => {
    if (!numbersLoading && numbers.length > 0) {
      const loadProgress = async () => {
        try {
          const user = auth.currentUser;
          if (!user) {
            setLearnedNumbers([]);
            return;
          }
          const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            const data = progressSnap.data() as any;
            const learnedItemIds: string[] = data.learnedItemIds || [];
            setLearnedNumbers(learnedItemIds.map(id => parseInt(id)));
          } else {
            setLearnedNumbers([]);
          }
        } catch (e) {
          console.error('❌ Error loading user progress:', e);
          setLearnedNumbers([]);
        }
      };
      loadProgress();
    }
  }, [numbersLoading, numbers.length]);

  // Check if all cards have been reviewed - moved to top level to avoid hooks order issues
  useEffect(() => {
    if (numbersToReview.length > 0 && processedNumbers.length === numbersToReview.length) {
        setAllCardsReviewed(true);
    }
  }, [processedNumbers, numbersToReview]);

  // Show loading state
  if (numbersLoading) {
    return (
        <CoursePageLoading 
          courseTitle="Learn numbers"
          message="Loading Georgian numbers..."
        />
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
          <Link href="/">Go back to home</Link>
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
    const learnedNumbersInLocal = learnedNumbers;
    const numbersMissingInLocal = numbers.filter((number: any) => !learnedNumbersInLocal.includes(number.id)) as NumberItem[];
    
    // Reset session state
    setProcessedNumbers([]);
    setSlideWidth(0);

    // Select a subset of numbers for this session (without shuffling)
    // Limit to 10 numbers per session for better learning experience
    const selectedNumbers = numbersMissingInLocal.slice(0, 10);

    // Update state to start the gameplay
    setNumbersToReview(selectedNumbers);
    setIsGameplayActive(true);

    // Calculate slide width after component renders for proper animations
    setTimeout(() => {
        const element = document.querySelector('.slider-slide');
        if(element){
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
    
    if(sliderTrack){
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
   * Persists a learned number to the progress store to maintain user progress across sessions
   * This function is called when a user confirms they've learned a number
   * @param numberId - The ID of the number to save as learned
   */
  const saveNumberToLocal = (numberId: number) => {
    const user = auth.currentUser;
    if (!user) return;
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
        const snap = await getDoc(progressRef);
        const current = snap.exists() ? (snap.data() as any) : null;
        const currentIds: string[] = current?.learnedItemIds || [];
        if (currentIds.includes(String(numberId))) return;
        const updatedIds = [...currentIds, String(numberId)];
        await setDoc(progressRef, {
          userId: user.uid,
          courseId: String(course_id),
          learnedItemIds: updatedIds,
          lastUpdated: serverTimestamp(),
          createdAt: current?.createdAt || serverTimestamp()
        });
      } catch (e) {
        console.error('❌ Error saving learned number:', e);
      }
    })();
  };

  /**
   * Marks a number as "to review" and advances to the next card
   * This function is called when the user clicks "Next card" without marking it as learned
   * @param numberId - The ID of the number to mark as reviewed
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsToReview = (numberId: number, index: number, element: HTMLElement | null) => {
    if (!processedNumbers.includes(numberId)) {
      setTimeout(() => {
        setProcessedNumbers((prevProcessedNumbers) => [...prevProcessedNumbers, numberId]);
        switchSlide(index, element);
      }, 250); // Small delay for better user experience
    }
  };

  /**
   * Initiates the process of marking a number as learned
   * Shows a confirmation dialog before actually marking it as learned
   * This is called when the user clicks "Mark as learned" button
   * @param numberId - The ID of the number to mark as learned
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide for animation
   */
  const markAsLearned = (numberId: number, index: number, element: HTMLElement | null) => {
    if (!processedNumbers.includes(numberId)) {
      // Store the action details to be executed after confirmation
      setPendingLearnedAction({ numberId, index, element });
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
      const { numberId, index, element } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedNumbers((prev) => [...prev, numberId]); // Add to processed numbers for this session
        setLearnedNumbers((prev) => [...prev, numberId]); // Add to learned numbers list
        switchSlide(index, element); // Animate to the next slide
        saveNumberToLocal(numberId); // Persist the learned status in localStorage
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
    setProcessedNumbers([]);
    setNumbersToReview([]);
    const user = auth.currentUser;
    if (!user) {
      setLearnedNumbers([]);
      return;
    }
    (async () => {
      try {
        const progressRef = doc(db, 'users', user.uid, 'progress', String(course_id));
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const data = progressSnap.data() as any;
          const learnedItemIds: string[] = data.learnedItemIds || [];
          setLearnedNumbers(learnedItemIds.map(id => parseInt(id)));
        } else {
          setLearnedNumbers([]);
        }
      } catch (e) {
        console.error('❌ Error reloading user progress:', e);
        setLearnedNumbers([]);
      }
    })();
  };

  // Main numbers page
  if (!isGameplayActive) {
    return (
        <div className='h-svh flex flex-col justify-between py-4'>

        <div className='w-full max-w-2xl mx-auto p-4'>
          <div className="navbar">
              <div className="navbar-row">
                  <div className="navbar-aside">
                  <Link href="/" className='navbar-button'>
                      <Image
                      src="/images/icon-back.svg"
                      alt="Back"
                      width={24}
                      height={24}
                      />
                  </Link>
                  </div>
                  <h1 className="navbar-title">Learn numbers</h1>
                  <div className="navbar-aside"></div>
              </div>
          </div>
        </div>

        <div className='w-full max-w-2xl mx-auto p-4'>
          <div className='text-center'>Learned <b>{learnedNumbers.length}</b> out of <b>{numbers.length}</b> numbers</div>
        </div>

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
            <div className={`screen-gameplay`}>

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
                            <div className="navbar-title"></div>
                            <div className="navbar-aside"></div>
                        </div>
                    </div>
                </div>

                <div className="gameplay-game">
                    <div className="slider">
                        <div className="slider-wrapper">
                        <div className="slider-track">
                            {numbersToReview.map((item, index) => {
                                const isProcessed = processedNumbers.includes(item.id);
                                const isLearned = learnedNumbers.includes(item.id);
                                return  <div key={item.id} 
                                            className={`slider-slide ${isProcessed ? 'processed' : 'not-processed'} ${isLearned ? 'learned' : 'not-learned'}`}
                                                style={{
                                                '--slide-width': slideWidth + 'px',
                                                } as React.CSSProperties}
                                        >
                                            <div className='slider-slide-inner'>

                                                <FlashcardNumber 
                                                    number={item} 
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
                    <p>If you're not sure whether you memorized all the numbers, you can reset your progress and start from 0.</p>
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
            title="Are you sure you want to mark this number as learned?"
            confirmText="Confirm"
            cancelText="Cancel"
            onConfirm={confirmMarkAsLearned}
            onCancel={cancelMarkAsLearned}
        />

    
    </div>
  )
}
