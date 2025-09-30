"use client";

import { useState, useEffect } from 'react';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore } from '@/stores/progressStore';
import { useFontTypeStore } from '@/stores/fontTypeStore';
import { AlphabetItem, PendingLearnedAction } from '@/types';
import { alphabet } from '@/data/alphabet';
import { shuffleArray } from '@/utils/shuffle-array';
import FlashcardLetter from '@/components/FlashcardLetter';
import ConfirmationDialog from '@/components/ShadcnConfirmationDialog';
import SuccessModal from '@/components/ShadcnSuccessModal';

import Image from 'next/image';
import Link from 'next/link';

export default function AlphabetCourse() {
  useBackToHomeNavigation();

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
  const { 
    getCourseProgress, 
    addLearnedItem, 
    isItemLearned, 
    initializeCourse,

  } = useProgressStore();

  useEffect(() => {
    
    initializeCourse('alphabet', alphabet.length);
    
    // Load learned characters from the store
    const alphabetProgress = getCourseProgress('alphabet');
    setLearnedCharacters(alphabetProgress.learnedItems);
  }, [initializeCourse, getCourseProgress]);

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
    const learnedCharactersInLocal = alphabetProgress.learnedItems;
    
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

  // Check if all cards have been reviewed
  useEffect(() => {
    if (charactersToReview.length > 0 && processedCharacters.length === charactersToReview.length) {
        setAllCardsReviewed(true);
    }
  }, [processedCharacters, charactersToReview]);

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
    addLearnedItem('alphabet', characterId);
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
    setLearnedCharacters(alphabetProgress.learnedItems);
  };

  // Main alphabet page
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
    )
  }

  // Gameplay component
  return (
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
                            <div className="navbar-title"></div>
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

        {allCardsReviewed && (
            <div className="screen-finish">

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

            </div>
        )}

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
