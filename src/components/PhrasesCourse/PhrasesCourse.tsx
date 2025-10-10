/**
 * Generic Phrases Course Component
 * Reusable component for all phrase-based courses with sentence construction gameplay
 */

"use client";

import { useState, useEffect } from 'react';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore } from '@/stores/progressStore';
import { PhraseAdvancedItem, PhraseAdvancedMemory } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import PhraseAdvancedComponent from '@/components/PhraseAdvancedComponent/PhraseAdvancedComponent';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import CoursePageLoading from '@/components/CoursePageLoading';
import PageTransition from '@/components/PageTransition';
import { MemoryProgressService } from '@/services/memoryProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';

import Image from 'next/image';
import Link from 'next/link';

interface PhrasesCourseProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
}

export default function PhrasesCourse({ 
  courseId, 
  courseTitle, 
  courseDescription 
}: PhrasesCourseProps) {
  useBackToHomeNavigation();
  
  const { currentUser } = useAuth();

  const [learnedPhrases, setLearnedPhrases] = useState<number[]>([]);
  const [phrasesMemory, setPhrasesMemory] = useState<Record<number, PhraseAdvancedMemory>>({});
  
  // Gameplay states
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedPhrases, setProcessedPhrases] = useState<number[]>([]);
  const [phrasesToReview, setPhrasesToReview] = useState<PhraseAdvancedItem[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Use the generic phrases course hook
  const { items: phrases, loading: phrasesLoading, error: phrasesError } = usePhrasesCourse(courseId);
  
  const { 
    getCourseProgress, 
    addLearnedItem, 
    initializeCourse,
  } = useProgressStore();

  // Data is now fetched via the usePhrasesCourse hook

  useEffect(() => {
    // Initialize course when phrases data is loaded and user is authenticated
    if (!phrasesLoading && phrases.length > 0 && currentUser) {
      initializeCourse(courseId, phrases.length);
      
      // Load memory progress from Firestore (using existing progress collection)
      const loadMemoryProgress = async () => {
        try {
          const memoryProgress = await MemoryProgressService.getMemoryProgress(courseId);
          
          // Initialize memory for all phrases, using saved data if available
          const initialMemory: Record<number, PhraseAdvancedMemory> = {};
          const learnedIds: number[] = [];
          
          phrases.forEach(phrase => {
            if (memoryProgress && memoryProgress.items) {
              const savedItem = memoryProgress.items.find(item => item.id === String(phrase.id));
              if (savedItem) {
                initialMemory[phrase.id] = savedItem.memory;
                if (savedItem.isLearned) {
                  learnedIds.push(phrase.id);
                }
              } else {
                initialMemory[phrase.id] = {
                  correctAnswers: 0,
                  isLearned: false
                };
              }
            } else {
              initialMemory[phrase.id] = {
                correctAnswers: 0,
                isLearned: false
              };
            }
          });
          
          setPhrasesMemory(initialMemory);
          setLearnedPhrases(learnedIds);
          
          // Also sync with local progress store
          learnedIds.forEach(phraseId => {
            addLearnedItem(courseId, String(phraseId));
          });
          
        } catch (error) {
          console.error('Error loading memory progress:', error);
          
          // Fallback to local store if Firestore fails
          const phrasesProgress = getCourseProgress(courseId);
          const learnedList = Array.from(phrasesProgress.learnedItems).map(Number);
          setLearnedPhrases(learnedList);
          
          const initialMemory: Record<number, PhraseAdvancedMemory> = {};
          phrases.forEach(phrase => {
            const isLearned = phrasesProgress.learnedItems.has(String(phrase.id));
            initialMemory[phrase.id] = {
              correctAnswers: isLearned ? 3 : 0,
              isLearned
            };
          });
          setPhrasesMemory(initialMemory);
        }
      };
      
      loadMemoryProgress();
    }
  }, [phrasesLoading, phrases.length, currentUser, initializeCourse, getCourseProgress, addLearnedItem, courseId]);

  // Check if all cards have been reviewed
  useEffect(() => {
    if (phrasesToReview.length > 0 && processedPhrases.length === phrasesToReview.length) {
      setAllCardsReviewed(true);
    } else {
      setAllCardsReviewed(false);
    }
  }, [processedPhrases, phrasesToReview]);

  // Show loading state
  if (phrasesLoading) {
    return (
      <PageTransition>
        <CoursePageLoading 
          courseTitle={courseTitle}
          message={`Loading ${courseTitle.toLowerCase()}...`}
        />
      </PageTransition>
    );
  }

  // Show error state
  if (phrasesError) {
    return (
      <PageTransition>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <p>Error loading phrases: {phrasesError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </PageTransition>
    );
  }

  // Show empty state
  if (phrases.length === 0) {
    return (
      <PageTransition>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <p>No phrases data found. Please use the migration page to add sample data.</p>
          <Link href="/migrate">Go to migration page</Link>
          <Link href="/">Go back to home</Link>
        </div>
      </PageTransition>
    );
  }

  /**
   * Initializes the gameplay session with phrase items
   * Selects random items from unlearned phrases
   */
  const startGameplay = () => {
    console.log('startGameplay called with phrases:', phrases);
    
    // Reset session state first
    setProcessedPhrases([]);
    setCurrentPhraseIndex(0);
    setAllCardsReviewed(false);

    // Get previously learned phrases from progress store
    const phrasesProgress = getCourseProgress(courseId);
    const learnedPhrasesInLocal = Array.from(phrasesProgress.learnedItems).map(Number);
    setLearnedPhrases(learnedPhrasesInLocal);
    
    console.log('Learned phrases:', learnedPhrasesInLocal);
    
    // Filter out phrases that have already been learned
    let phrasesMissingInLocal = phrases.filter((phrase: any) => !learnedPhrasesInLocal.includes(phrase.id)) as PhraseAdvancedItem[];
    
    console.log('Unlearned phrases:', phrasesMissingInLocal);
    
    // If no unlearned phrases, use all phrases for review
    if (phrasesMissingInLocal.length === 0) {
      phrasesMissingInLocal = [...phrases] as PhraseAdvancedItem[];
      console.log('Using all phrases since none unlearned');
    }

    // Shuffle remaining phrases and select a subset for this session
    const shuffledPhrasesMissingInLocal = shuffleArray(phrasesMissingInLocal);
    // Limit to 5 phrases per session for better learning experience
    const selectedPhrases = shuffledPhrasesMissingInLocal.slice(0, 5);

    console.log('Selected phrases for session:', selectedPhrases);

    // Update state to start the gameplay
    setPhrasesToReview(selectedPhrases);
    setIsGameplayActive(true);
  };

  /**
   * Handles wrong answer - decrements memory
   */
  const handleWrongAnswer = async (phraseId: number) => {
    try {
      // Update memory in Firestore
      const updatedMemory = await MemoryProgressService.decrementCorrectAnswers(courseId, String(phraseId));
      
      // Update local state
      setPhrasesMemory(prev => ({
        ...prev,
        [phraseId]: updatedMemory
      }));
      
      // If item was previously learned but now isn't, remove from learned list
      if (updatedMemory.correctAnswers < 3) {
        setLearnedPhrases(prevLearned => prevLearned.filter(id => id !== phraseId));
      }
      
    } catch (error) {
      console.error('Error updating memory progress:', error);
      
      // Fallback to local-only update if Firestore fails
      setPhrasesMemory(prev => {
        const currentMemory = prev[phraseId] || { correctAnswers: 0, isLearned: false };
        const newCorrectAnswers = Math.max(currentMemory.correctAnswers - 1, 0);
        const isLearned = newCorrectAnswers >= 3;
        
        const newMemory = {
          correctAnswers: newCorrectAnswers,
          isLearned
        };
        
        return {
          ...prev,
          [phraseId]: newMemory
        };
      });
    }
  };

  /**
   * Handles correct answer - increments memory and auto-learns if needed
   */
  const handleCorrectAnswer = async (phraseId: number) => {
    try {
      // Update memory in Firestore
      const updatedMemory = await MemoryProgressService.incrementCorrectAnswers(courseId, String(phraseId));
      
      // Update local state
      setPhrasesMemory(prev => {
        const currentMemory = prev[phraseId] || { correctAnswers: 0, isLearned: false };
        
        // If phrase is now learned, update learned list
        if (updatedMemory.isLearned && !currentMemory.isLearned) {
          savePhraseToLocal(phraseId);
          setLearnedPhrases(prevLearned => {
            if (!prevLearned.includes(phraseId)) {
              return [...prevLearned, phraseId];
            }
            return prevLearned;
          });
        }
        
        return {
          ...prev,
          [phraseId]: updatedMemory
        };
      });
      
    } catch (error) {
      console.error('Error updating memory progress:', error);
      
      // Fallback to local-only update if Firestore fails
      setPhrasesMemory(prev => {
        const currentMemory = prev[phraseId] || { correctAnswers: 0, isLearned: false };
        const newCorrectAnswers = Math.min(currentMemory.correctAnswers + 1, 3);
        const isLearned = newCorrectAnswers >= 3;
        
        const newMemory = {
          correctAnswers: newCorrectAnswers,
          isLearned
        };
        
        // If phrase is now learned, save to store
        if (isLearned && !currentMemory.isLearned) {
          savePhraseToLocal(phraseId);
          setLearnedPhrases(prevLearned => {
            if (!prevLearned.includes(phraseId)) {
              return [...prevLearned, phraseId];
            }
            return prevLearned;
          });
        }
        
        return {
          ...prev,
          [phraseId]: newMemory
        };
      });
    }
  };

  /**
   * Persists a learned phrase to the progress store
   */
  const savePhraseToLocal = (phraseId: number) => {
    addLearnedItem(courseId, String(phraseId));
  };

  /**
   * Marks a phrase as "to review" and advances to the next card
   */
  const markAsToReview = (phraseId: number, index: number, element: HTMLElement | null) => {
    if (!processedPhrases.includes(phraseId)) {
      setTimeout(() => {
        setProcessedPhrases((prevProcessedPhrases) => [...prevProcessedPhrases, phraseId]);
      }, 250);
    }
  };

  // Reset gameplay and go back to main page
  const resetGameplay = () => {
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedPhrases([]);
    setPhrasesToReview([]);
    setCurrentPhraseIndex(0);
    // Reload learned phrases count
    const phrasesProgress = getCourseProgress(courseId);
    setLearnedPhrases(Array.from(phrasesProgress.learnedItems).map(Number));
  };

  // Main phrases page
  if (!isGameplayActive) {
    return (
      <PageTransition>
        <div className='phrases-advanced-course h-svh flex flex-col justify-between py-4'>
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
                <h1 className="navbar-title">{courseTitle}</h1>
                <div className="navbar-aside"></div>
              </div>
            </div>
          </div>

          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className='text-center'>
              Learned <b>{learnedPhrases.length}</b> out of <b>{phrases.length}</b> phrases
            </div>
          </div>

          <div className='w-full max-w-2xl mx-auto p-4'>
            <button onClick={startGameplay} className='btn btn-block btn-primary'>
              Start learning
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Gameplay component
  return (
    <PageTransition>
      <div className='phrases-advanced-course h-svh flex flex-col justify-between py-4'>

        {!allCardsReviewed && phrasesToReview.length > 0 && (
          <>
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
                    <ProgressBar 
                      current={processedPhrases.length} 
                      total={phrasesToReview.length}
                      width="200px"
                    />
                  </div>
                  <div className="navbar-aside"></div>
                </div>
              </div>
            </div>

            <div className='w-full max-w-2xl mx-auto p-4'>
              {phrasesToReview.map((item, index) => {
                // Only show the current unprocessed phrase
                if (index === processedPhrases.length) {
                  return (
                    <PhraseAdvancedComponent 
                      key={item.id}
                      phrase={item}
                      memory={phrasesMemory[item.id] || { correctAnswers: 0, isLearned: false }}
                      onNext={() => markAsToReview(item.id, index, null)}
                      onCorrectAnswer={() => handleCorrectAnswer(item.id)}
                      onWrongAnswer={() => handleWrongAnswer(item.id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          </>
        )}

        {allCardsReviewed && (
          <div className="screen-finish">
            <div className="finish-message">
              <div className='text-center text-4xl'>🎉</div>
              <h2 className='font-semibold text-2xl'>Great work!</h2>
              <div className='text-lg finish-message-text'>
                <p>You've reviewed all the phrases for this session. You learned <b>{learnedPhrases.filter(id => phrasesToReview.some(phrase => phrase.id === id)).length}</b> new items!</p>
                <p>Total progress: <b>{learnedPhrases.length}</b> out of <b>{phrases.length}</b> phrases learned.</p>
              </div>
              <div className='finish-message-actions'>
                <button onClick={resetGameplay} className='btn btn-small btn-secondary'>Go back</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  )
}