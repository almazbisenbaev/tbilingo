"use client";

const course_id = 4;
console.log(course_id);

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBackToHomeNavigation } from '@/utils/useBackButtonHandler';
import { useProgressStore } from '@/stores/progressStore';
import { PhraseAdvancedItem, PhraseAdvancedMemory } from '@/types';
import { shuffleArray } from '@/utils/shuffle-array';
import { MemoryProgressService } from '@/services/memoryProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
// UI Components
import CoursePageLoading from '@/components/CoursePageLoading';
import PageTransition from '@/components/PageTransition';
import ErrorState from '@/components/common/ErrorState';
import AppHeader from '@/components/layout/AppHeader';
import PageLayout from '@/components/layout/PageLayout';
import ContentContainer from '@/components/layout/ContentContainer';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import SentenceForm from '@/components/SentenceForm/SentenceForm';

import Image from 'next/image';
import Link from 'next/link';

const COURSE_ID = '4';
const COURSE_TITLE = 'Phrases Advanced';
const COURSE_DESCRIPTION = 'Advanced Georgian phrases with sentence construction gameplay';

export default function PhrasesAdvancedPage() {
  useBackToHomeNavigation();
  
  const { currentUser } = useAuth();
  const { items: phrases, loading: phrasesLoading, error: phrasesError } = usePhrasesCourse(COURSE_ID);
  const { getCourseProgress, addLearnedItem, initializeCourse } = useProgressStore();
  
  const [learnedPhrases, setLearnedPhrases] = useState<number[]>([]);
  const [phrasesMemory, setPhrasesMemory] = useState<Record<number, PhraseAdvancedMemory>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedPhrases, setProcessedPhrases] = useState<number[]>([]);
  const [phrasesToReview, setPhrasesToReview] = useState<PhraseAdvancedItem[]>([]);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Initialize course memory
  useEffect(() => {
    if (!phrasesLoading && phrases.length > 0 && currentUser && !isInitialized) {
      initializeCourse(COURSE_ID, phrases.length);
      
      const loadMemoryProgress = async () => {
        try {
          const memoryProgress = await MemoryProgressService.getMemoryProgress(COURSE_ID);
          
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
                initialMemory[phrase.id] = { correctAnswers: 0, isLearned: false };
              }
            } else {
              initialMemory[phrase.id] = { correctAnswers: 0, isLearned: false };
            }
          });
          
          setPhrasesMemory(initialMemory);
          setLearnedPhrases(learnedIds);
          
          learnedIds.forEach(phraseId => {
            addLearnedItem(COURSE_ID, String(phraseId));
          });
          
        } catch (error) {
          console.error('Error loading memory progress:', error);
          
          const phrasesProgress = getCourseProgress(COURSE_ID);
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
      setIsInitialized(true);
    }
  }, [phrasesLoading, phrases.length, currentUser, initializeCourse, getCourseProgress, addLearnedItem, isInitialized]);

  // Check if all cards reviewed
  useEffect(() => {
    if (phrasesToReview.length > 0 && processedPhrases.length === phrasesToReview.length) {
      setAllCardsReviewed(true);
    } else {
      setAllCardsReviewed(false);
    }
  }, [processedPhrases, phrasesToReview]);

  const handleCorrectAnswer = async (phraseId: number) => {
    try {
      const updatedMemory = await MemoryProgressService.incrementCorrectAnswers(COURSE_ID, String(phraseId));
      
      setPhrasesMemory(prev => {
        const currentMemory = prev[phraseId] || { correctAnswers: 0, isLearned: false };
        
        if (updatedMemory.isLearned && !currentMemory.isLearned) {
          addLearnedItem(COURSE_ID, String(phraseId));
          setLearnedPhrases(prevLearned => {
            if (!prevLearned.includes(phraseId)) {
              return [...prevLearned, phraseId];
            }
            return prevLearned;
          });
        }
        
        return { ...prev, [phraseId]: updatedMemory };
      });
    } catch (error) {
      console.error('Error updating memory progress:', error);
    }
  };

  const handleWrongAnswer = async (phraseId: number) => {
    try {
      const updatedMemory = await MemoryProgressService.decrementCorrectAnswers(COURSE_ID, String(phraseId));
      
      setPhrasesMemory(prev => ({
        ...prev,
        [phraseId]: updatedMemory
      }));
      
      if (updatedMemory.correctAnswers < 3) {
        setLearnedPhrases(prevLearned => prevLearned.filter(id => id !== phraseId));
      }
    } catch (error) {
      console.error('Error updating memory progress:', error);
    }
  };

  const startGameplay = () => {
    setProcessedPhrases([]);
    setAllCardsReviewed(false);

    const phrasesProgress = getCourseProgress(COURSE_ID);
    const learnedPhrasesInLocal = Array.from(phrasesProgress.learnedItems).map(Number);
    
    let phrasesMissingInLocal = phrases.filter((phrase) => !learnedPhrasesInLocal.includes(phrase.id));
    
    if (phrasesMissingInLocal.length === 0) {
      phrasesMissingInLocal = [...phrases];
    }

    const shuffledPhrasesMissingInLocal = shuffleArray(phrasesMissingInLocal);
    const selectedPhrases = shuffledPhrasesMissingInLocal.slice(0, 5);

    setPhrasesToReview(selectedPhrases);
    setIsGameplayActive(true);
  };

  const resetGameplay = () => {
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedPhrases([]);
    setPhrasesToReview([]);
  };

  const markAsToReview = (phraseId: number) => {
    if (!processedPhrases.includes(phraseId)) {
      setTimeout(() => {
        setProcessedPhrases((prev) => [...prev, phraseId]);
      }, 250);
    }
  };

  // Show loading state
  if (phrasesLoading) {
    return (
      <PageTransition>
        <CoursePageLoading 
          courseTitle={COURSE_TITLE}
          message={`Loading ${COURSE_TITLE.toLowerCase()}...`}
        />
      </PageTransition>
    );
  }

  // Show error state
  if (phrasesError) {
    return (
      <ErrorState 
        title="Loading Error"
        message={`Error loading phrases: ${phrasesError}`}
        actionText="Go Home"
        actionHref="/"
        showRetry={true}
      />
    );
  }

  // Show empty state
  if (phrases.length === 0) {
    return (
      <ErrorState 
        title="No Data Found"
        message="No phrases data found. Please use the migration page to add sample data."
        actionText="Go to Migration"
        actionHref="/migrate"
        showRetry={false}
      />
    );
  }

  // Course intro page
  if (!isGameplayActive) {
    return (
      <PageTransition>
        <div className='h-svh flex flex-col justify-between py-4'>
          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className="navbar">
              <div className="navbar-row">
                <div className="navbar-aside">
                  <Link href="/" className='navbar-button'>
                    <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
                  </Link>
                </div>
                <h1 className="navbar-title">{COURSE_TITLE}</h1>
                <div className="navbar-aside"></div>
              </div>
            </div>
          </div>

          <div className='w-full max-w-2xl mx-auto p-4'>
            {COURSE_DESCRIPTION && (
              <div className="text-center mb-6">
                <p className="text-gray-600">{COURSE_DESCRIPTION}</p>
              </div>
            )}
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
    );
  }

  // Course completion page
  if (allCardsReviewed) {
    const sessionLearnedCount = learnedPhrases.filter(id => 
      phrasesToReview.some(phrase => phrase.id === id)
    ).length;
    
    return (
      <PageTransition>
        <motion.div 
          className='h-svh flex flex-col justify-between py-4'
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className="navbar">
              <div className="navbar-row">
                <div className="navbar-aside">
                  <button onClick={resetGameplay} className='navbar-button'>
                    <Image src="/images/icon-back.svg" alt="Back" width={24} height={24} />
                  </button>
                </div>
                <h1 className="navbar-title">{COURSE_TITLE}</h1>
                <div className="navbar-aside"></div>
              </div>
            </div>
          </div>

          <div className='w-full max-w-2xl mx-auto p-4'>
            <div className="text-center">
              <div className='text-4xl mb-4'>🎉</div>
              <h2 className='font-semibold text-2xl mb-4'>Great work!</h2>
              <div className='text-lg'>
                <p className='mb-2'>You completed this session!</p>
                <p className='mb-2'>Session progress: <b>{sessionLearnedCount}</b> phrases mastered</p>
                <p>Total progress: <b>{learnedPhrases.length}</b> / <b>{phrases.length}</b> learned</p>
              </div>
            </div>
          </div>

          <div className='w-full max-w-2xl mx-auto p-4'>
            <button onClick={startGameplay} className='btn btn-block btn-primary mb-2'>
              Continue Learning
            </button>
            <button onClick={resetGameplay} className='btn btn-block btn-secondary'>
              Go Back
            </button>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  // Active gameplay
  return (
    <PageTransition>
      <PageLayout className="phrases-advanced-course">
        <ContentContainer>
          <AppHeader 
            title={
              <ProgressBar 
                current={processedPhrases.length} 
                total={phrasesToReview.length}
                width="200px"
              />
            }
            showBackButton
            onBackClick={resetGameplay}
          />
        </ContentContainer>

        <ContentContainer>
          {phrasesToReview.map((item, index) => {
            if (index === processedPhrases.length) {
              return (
                <SentenceForm 
                  key={item.id}
                  phrase={item}
                  memory={phrasesMemory[item.id] || { correctAnswers: 0, isLearned: false }}
                  onNext={() => markAsToReview(item.id)}
                  onCorrectAnswer={() => handleCorrectAnswer(item.id)}
                  onWrongAnswer={() => handleWrongAnswer(item.id)}
                />
              );
            }
            return null;
          })}
        </ContentContainer>
      </PageLayout>
    </PageTransition>
  );
}
