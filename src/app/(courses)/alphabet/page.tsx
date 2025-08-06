"use client";

import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import shuffleArray from '@/utils/shuffle-array';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';

import { alphabet } from '@/data/alphabet';
import { useFontStore } from '@/stores/fontStore';
import Flashcard from '@/components/Flashcard';

// Type for a single alphabet letter
interface AlphabetLetter {
  character: string;
  name: string;
  pronunciation: string;
  id: number;
  audioUrl: string;
}

export default function AlphabetCourse() {
  useBackToHomeNavigation();

  const [learnedCharacters, setLearnedCharacters] = useState<number[]>([]); // Store characters that the viewers has seen suring the gameplay
  const [learnedCharactersCount, setLearnedCharactersCount] = useState<number>(0); // Store the learned characters from localstorage

  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedCharacters, setProcessedCharacters] = useState<number[]>([]); 
  const [charactersToReview, setCharactersToReview] = useState<AlphabetLetter[]>([]);
  const [slideWidth, setSlideWidth] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingLearnedAction, setPendingLearnedAction] = useState<{characterId: number, index: number, element: HTMLElement | null} | null>(null);

  const { fontType } = useFontStore();

  useEffect(() => {
    
    // Load learned characters from localstorage
    const learnedCharactersInLocal = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    setLearnedCharacters(learnedCharactersInLocal);
    setLearnedCharactersCount(learnedCharactersInLocal.length);

  }, []);

  // Initialize gameplay
  const startGameplay = () => {
    const learnedCharactersInLocal = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    const charactersMissingInLocal = alphabet.filter((letter: any) => !learnedCharactersInLocal.includes(letter.id)) as AlphabetLetter[];
    
    setProcessedCharacters([]);
    setLearnedCharacters(learnedCharactersInLocal);
    setSlideWidth(0);

    const shuffledCharactersMissingInLocal = shuffleArray(charactersMissingInLocal);
    const selectedCharacters = shuffledCharactersMissingInLocal.slice(0, 10);

    setCharactersToReview(selectedCharacters);
    setIsGameplayActive(true);

    setTimeout(() => {
        const element = document.querySelector('.slider-slide');
        if(element){
            const slideWidth = element.getBoundingClientRect().width;
            setSlideWidth(slideWidth);
        }
    }, 200);
  };

  // Check if all cards have been reviewed
  useEffect(() => {
    if (charactersToReview.length > 0 && processedCharacters.length === charactersToReview.length) {
        setAllCardsReviewed(true);
    }
  }, [processedCharacters, charactersToReview]);

  // The function that moves the slides when a flashcard is processed
  const switchSlide = (index: number, element: HTMLElement | null) => {
    if (!element) return;
    const slideWidth = element.getBoundingClientRect().width;
    const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;
    if(sliderTrack){
        // Get current translateX value
        const currentTransform = getComputedStyle(sliderTrack).transform;
        const matrix = new window.DOMMatrix(currentTransform);
        const currentTranslateX = matrix.m41; // Get the current translateX value
        // Update the transform by adding the element width
        sliderTrack.style.transform = `translateX(${currentTranslateX - slideWidth}px)`;
    }
  }

  // Add the letter to the list of learned letters in localstorage
  const saveLetterToLocal = (characterId: number) => {
    const learnedCharactersInLocal: number[] = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    localStorage.setItem('learnedLetters', JSON.stringify([...learnedCharactersInLocal, characterId]));
  }

  // What happens when user just switches to the next card
  const markAsToReview = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      setTimeout(() => {
        setProcessedCharacters((prevProcessedCharacters) => [...prevProcessedCharacters, characterId]);
        switchSlide(index, element);
      }, 250);
    }
  };

  // What happens when user marks a character as learned
  const markAsLearned = (characterId: number, index: number, element: HTMLElement | null) => {
    if (!processedCharacters.includes(characterId)) {
      setPendingLearnedAction({ characterId, index, element });
      setShowConfirmation(true);
    }
  };

  // Handle confirmation for marking as learned
  const confirmMarkAsLearned = () => {
    if (pendingLearnedAction) {
      const { characterId, index, element } = pendingLearnedAction;
      setTimeout(() => {
        setProcessedCharacters((prev) => [...prev, characterId]); // Add to processed characters
        setLearnedCharacters((prev) => [...prev, characterId]); // Add to processed characters
        switchSlide(index, element); // Jump to the next slide
        saveLetterToLocal(characterId); // Save letter to localstorage
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
    setProcessedCharacters([]);
    setCharactersToReview([]);
    // Reload learned characters count
    const learnedCharactersInLocal = JSON.parse(localStorage.getItem('learnedLetters') || '[]');
    setLearnedCharactersCount(learnedCharactersInLocal.length);
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
          <div className='text-center'>Learned <b>{learnedCharactersCount}</b> out of <b>{alphabet.length}</b> characters</div>
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

                                                <Flashcard 
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
                <h2 className='finish-message-title'>All cards reviewed 🙌</h2>
                <div className='finish-message-text'>
                    <p>You've looked through all the flashcards. You can go back to the homepage and start over.</p>
                    <p>If you're not sure whether you memorized all the letters, you can reset your progress and start from 0.</p>
                </div>
                <div className='finish-message-actions'>
                    <button onClick={resetGameplay} className='btn btn-small btn-secondary'>Go back</button>
                </div>
                </div>

            </div>
        )}

        {/* Confirmation Dialog for Mark as Learned */}
        {showConfirmation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
                    <h3 className="text-lg text-center font-semibold mb-6">Are you sure you want to mark this character as learned? </h3>
                    <div className="flex gap-3">
                        <button 
                            onClick={cancelMarkAsLearned}
                            className="btn btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmMarkAsLearned}
                            className="btn btn-primary flex-1"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )}

    
    </div>
  )
}
