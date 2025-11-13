"use client";

const course_id = 1;
console.log('Course ID: ' + course_id);

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore, useStoreHydration } from '@/stores/progressStore';
import { useFontTypeStore } from '@/stores/fontTypeStore';
import { EnhancedFirebaseService } from '@/services/enhancedFirebase';
import { AlphabetItem } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import FlashcardLetter from '@/components/FlashcardLetter/FlashcardLetter';
import ConfirmationDialog from '@/components/ShadcnConfirmationDialog';
// import SuccessModal from '@/components/ShadcnSuccessModal';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import CoursePageLoading from '@/components/CoursePageLoading';
import PageTransition from '@/components/PageTransition';

import Image from 'next/image';
import Link from 'next/link';

export default function AlphabetCourse() {
  // All hooks must be at the top level and called in the same order every time
  useBackToHomeNavigation();

  // State for alphabet data fetching
  const [alphabet, setAlphabet] = useState<AlphabetItem[]>([]);
  const [alphabetLoading, setAlphabetLoading] = useState<boolean>(true);
  const [alphabetError, setAlphabetError] = useState<string | null>(null);

  const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen during the gameplay
  
  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedCharacters, setProcessedCharacters] = useState<number[]>([]); 
  const [charactersToReview, setCharactersToReview] = useState<AlphabetItem[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<{characterId: number, index: number, element: HTMLElement | null} | null>(null);

  const { fontType } = useFontTypeStore();
  const isHydrated = useStoreHydration();
  
  const { 
    getCourseProgress, 
    addLearnedItem, 
    initializeCourse,

  } = useProgressStore();

  // Fetch alphabet data from Firebase
  useEffect(() => {
    const fetchAlphabetData = async () => {
      try {
        setAlphabetLoading(true);
        setAlphabetError(null);
        
        // Fetch course items for alphabet (course ID '1')
        const items = await EnhancedFirebaseService.getCourseItems(String(course_id));
        
        // Transform the data to match AlphabetItem interface
        const alphabetItems: AlphabetItem[] = items.map(item => ({
          id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
          character: (item as any).character,
          name: (item as any).name,
          pronunciation: (item as any).pronunciation,
          audioUrl: (item as any).audioUrl || ''
        }));
        
        setAlphabet(alphabetItems);
        
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
    // Initialize course when alphabet data is loaded
    if (!alphabetLoading && alphabet.length > 0) {
      initializeCourse('alphabet', alphabet.length);
      
      // Load learned characters from the store
      const alphabetProgress = getCourseProgress('alphabet');
      setLearnedCharacters(Array.from(alphabetProgress.learnedItems).map(Number));
    }
  }, [alphabetLoading, alphabet.length, initializeCourse, getCourseProgress]);

  // Show loading state
  if (alphabetLoading) {
    return (
      <PageTransition>
        <CoursePageLoading 
          courseTitle="Learn alphabet"
          message="Loading Georgian alphabet..."
        />
      </PageTransition>
    );
  }

  // Show error state
  if (alphabetError) {
    return (
      <PageTransition>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <p>Error loading alphabet: {alphabetError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </PageTransition>
    );
  }

  // Show empty state
  if (alphabet.length === 0) {
    return (
      <PageTransition>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <p>No alphabet data found. Please check the manual data entry guide.</p>
          <Link href="/">Go back to home</Link>
        </div>
      </PageTransition>
    );
  }

  /**
   * Initializes the gameplay session with flashcards
   * This function:
   * 1. Loads the user's progress from localStorage
   * 2. Filters out already learned characters
   * 3. Randomly selects characters for the current session
   * 4. Sets up the UI for the learning experience
   */
  const startGameplay = () => {
    // Get previously learned characters from progress store
    const alphabetProgress = getCourseProgress('alphabet');
    const learnedCharactersInLocal = Array.from(alphabetProgress.learnedItems).map(Number);
    
    // Filter out characters that have already been learned
    const charactersMissingInLocal = alphabet.filter((letter: any) => !learnedCharactersInLocal.includes(letter.id)) as AlphabetItem[];
    
    // Reset session state
    setProcessedCharacters([]);
    setLearnedCharacters(learnedCharactersInLocal);
    setSlideWidth(0);

    // Shuffle remaining characters and select a subset for this session
    const shuffledCharactersMissingInLocal = shuffleArray(charactersMissingInLocal);
    // Limit to 10 characters per session for better learning experience
    const selectedCharacters = shuffledCharactersMissingInLocal.slice(0, 10);

    // Update state to start the gameplay
    setCharactersToReview(selectedCharacters);
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
   * Persists a learned letter to the progress store to maintain user progress across sessions
   * This function is called when a user confirms they've learned a character
   * @param characterId - The ID of the character to save as learned
   */
  const saveLetterToLocal = (characterId: number) => {
    // Add the learned character to the progress store
    addLearnedItem('alphabet', String(characterId));
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
   * 4. Saves the learned status to localStorage
   */
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { characterId, index, element } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedCharacters((prev) => [...prev, characterId]); // Add to processed characters for this session
        setLearnedCharacters((prev) => [...prev, characterId]); // Add to learned characters list
        switchSlide(index, element); // Animate to the next slide
        saveLetterToLocal(characterId); // Persist the learned status in localStorage
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
    // Reload learned characters count
    const alphabetProgress = getCourseProgress('alphabet');
    setLearnedCharacters(Array.from(alphabetProgress.learnedItems).map(Number));
  };

  // Main alphabet page
  if (!isGameplayActive) {
    return (
      <PageTransition>
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
                  <h1 className="navbar-title">Learn alphabet</h1>
                  <div className="navbar-aside"></div>
              </div>
          </div>
        </div>

        <div className='w-full max-w-2xl mx-auto p-4'>
          <div className='text-center'>Learned <b>{learnedCharacters.length}</b> out of <b>{alphabet.length}</b> characters</div>
        </div>

        <div className='w-full max-w-2xl mx-auto p-4'>
          <button onClick={startGameplay} className='btn btn-block btn-primary'>Start learning</button>
        </div>

        </div>
      </PageTransition>
    )
  }

  // Gameplay component
  return (
    <PageTransition>
      <div className='h-svh flex flex-col justify-between py-4'>

        {!allCardsReviewed && (
            <div className={`screen-gameplay font-type-${fontType}`}>

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
                                current={processedCharacters.length} 
                                total={charactersToReview.length}
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
                            {charactersToReview.map((item, index) => {
                                const isProcessed = processedCharacters.includes(item.id);
                                const isLearned = learnedCharacters.includes(item.id);
                                return  <div key={item.id} 
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
                    <p>If you're not sure whether you memorized all the letters, you can reset your progress and start from 0.</p>
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
    </PageTransition>
  )
}
