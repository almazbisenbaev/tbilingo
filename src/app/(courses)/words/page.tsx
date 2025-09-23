"use client";

import { useState, useEffect } from 'react';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore } from '@/stores/progressStore';
import { WordItem, PendingWordAction } from '@/types';
import { words } from '@/data/words';
import { shuffleArray } from '@/utils/shuffle-array';
import WordsComponent from '@/components/WordsComponent';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import ProgressBar from '@/components/ProgressBar';

import Image from 'next/image';
import Link from 'next/link';

export default function WordsCourse() {
  useBackToHomeNavigation();

  const [learnedWords, setLearnedWords] = useState<number[]>([]); // Store words that the user has learned
  
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

  const { 
    getCourseProgress, 
    addLearnedItem, 
    isItemLearned, 
    initializeCourse,
  } = useProgressStore();

  useEffect(() => {
    // Initialize the words course
    initializeCourse('words', words.length);
    
    // Load learned words from the store
    const wordsProgress = getCourseProgress('words');
    setLearnedWords(wordsProgress.learnedItems);
  }, [initializeCourse, getCourseProgress]);

  /**
   * Initializes the gameplay session with word/phrase items
   * Selects 10 random items from unlearned words
   */
  const startGameplay = () => {
    // Get previously learned words from progress store
    const wordsProgress = getCourseProgress('words');
    const learnedWordsInLocal = wordsProgress.learnedItems;
    
    // Filter out words that have already been learned
    const wordsMissingInLocal = words.filter((word: any) => !learnedWordsInLocal.includes(word.id)) as WordItem[];
    
    // Reset session state
    setProcessedWords([]);
    setLearnedWords(learnedWordsInLocal);
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
        if(element){
            const slideWidth = element.getBoundingClientRect().width;
            setSlideWidth(slideWidth);
        }
    }, 200); // Short delay to ensure DOM is ready
  };

  // Check if all cards have been reviewed
  useEffect(() => {
    if (wordsToReview.length > 0 && processedWords.length === wordsToReview.length) {
        setAllCardsReviewed(true);
    }
  }, [processedWords, wordsToReview]);

  /**
   * Handles the animation between word cards by sliding the track horizontally
   * @param index - The index of the current slide
   * @param element - The DOM element of the current slide
   */
  const switchSlide = (index: number, element: HTMLElement | null) => {
    if (!element) return;
    
    const slideWidth = element.getBoundingClientRect().width;
    const sliderTrack = document.querySelector('.slider-track') as HTMLElement | null;
    
    if(sliderTrack){
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
    addLearnedItem('words', wordId);
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
    // Reload learned words count
    const wordsProgress = getCourseProgress('words');
    setLearnedWords(wordsProgress.learnedItems);
  };

  // Main words page
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
                  <h1 className="navbar-title">Words & Phrases - Basic</h1>
                  <div className="navbar-aside"></div>
              </div>
          </div>
        </div>

        <div className='w-full max-w-2xl mx-auto p-4'>
          <div className='text-center'>Learned <b>{learnedWords.length}</b> out of <b>{words.length}</b> words & phrases</div>
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
                                return  <div key={item.id} 
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

        {allCardsReviewed && (
            <div className="screen-finish">
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
            </div>
        )}

        {/* Confirmation Dialog for Mark as Learned */}
        {showConfirmation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
                    <h3 className="text-lg text-center font-semibold mb-6">Are you sure you want to mark this item as learned?</h3>
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