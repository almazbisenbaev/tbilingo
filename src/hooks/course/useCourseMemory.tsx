import { useState, useEffect } from 'react';
import { PhraseAdvancedItem, PhraseAdvancedMemory } from '@/types';
import { useProgressStore } from '@/stores/progressStore';
import { MemoryProgressService } from '@/services/memoryProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { usePhrasesCourse } from '@/hooks/useEnhancedLearningContent';
import { shuffleArray } from '@/utils/shuffle-array';

export function useCourseMemory(courseId: string) {
  const { currentUser } = useAuth();
  const { items: phrases, loading: phrasesLoading } = usePhrasesCourse(courseId);
  const { getCourseProgress, addLearnedItem, initializeCourse } = useProgressStore();
  
  const [learnedPhrases, setLearnedPhrases] = useState<number[]>([]);
  const [phrasesMemory, setPhrasesMemory] = useState<Record<number, PhraseAdvancedMemory>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize course when phrases data is loaded and user is authenticated
    if (!phrasesLoading && phrases.length > 0 && currentUser && !isInitialized) {
      initializeCourse(courseId, phrases.length);
      
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
      setIsInitialized(true);
    }
  }, [phrasesLoading, phrases.length, currentUser, initializeCourse, getCourseProgress, addLearnedItem, courseId, isInitialized]);

  const handleCorrectAnswer = async (phraseId: number) => {
    try {
      const updatedMemory = await MemoryProgressService.incrementCorrectAnswers(courseId, String(phraseId));
      
      setPhrasesMemory(prev => {
        const currentMemory = prev[phraseId] || { correctAnswers: 0, isLearned: false };
        
        if (updatedMemory.isLearned && !currentMemory.isLearned) {
          addLearnedItem(courseId, String(phraseId));
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
      // Fallback logic here
    }
  };

  const handleWrongAnswer = async (phraseId: number) => {
    try {
      const updatedMemory = await MemoryProgressService.decrementCorrectAnswers(courseId, String(phraseId));
      
      setPhrasesMemory(prev => ({
        ...prev,
        [phraseId]: updatedMemory
      }));
      
      if (updatedMemory.correctAnswers < 3) {
        setLearnedPhrases(prevLearned => prevLearned.filter(id => id !== phraseId));
      }
      
    } catch (error) {
      console.error('Error updating memory progress:', error);
      // Fallback logic here
    }
  };

  return {
    phrases,
    phrasesLoading,
    learnedPhrases,
    phrasesMemory,
    handleCorrectAnswer,
    handleWrongAnswer,
    setLearnedPhrases
  };
}

export function useCourseGameplay(courseId: string, phrases: PhraseAdvancedItem[]) {
  const { getCourseProgress } = useProgressStore();
  
  const [isGameplayActive, setIsGameplayActive] = useState<boolean>(false);
  const [processedPhrases, setProcessedPhrases] = useState<number[]>([]);
  const [phrasesToReview, setPhrasesToReview] = useState<PhraseAdvancedItem[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [allCardsReviewed, setAllCardsReviewed] = useState<boolean>(false);

  // Check if all cards have been reviewed
  useEffect(() => {
    if (phrasesToReview.length > 0 && processedPhrases.length === phrasesToReview.length) {
      setAllCardsReviewed(true);
    } else {
      setAllCardsReviewed(false);
    }
  }, [processedPhrases, phrasesToReview]);

  const startGameplay = () => {
    // Reset session state first
    setProcessedPhrases([]);
    setCurrentPhraseIndex(0);
    setAllCardsReviewed(false);

    // Get previously learned phrases from progress store
    const phrasesProgress = getCourseProgress(courseId);
    const learnedPhrasesInLocal = Array.from(phrasesProgress.learnedItems).map(Number);
    
    // Filter out phrases that have already been learned
    let phrasesMissingInLocal = phrases.filter((phrase) => !learnedPhrasesInLocal.includes(phrase.id));
    
    // If no unlearned phrases, use all phrases for review
    if (phrasesMissingInLocal.length === 0) {
      phrasesMissingInLocal = [...phrases];
    }

    // Shuffle remaining phrases and select a subset for this session
    const shuffledPhrasesMissingInLocal = shuffleArray(phrasesMissingInLocal);
    // Limit to 5 phrases per session for better learning experience
    const selectedPhrases = shuffledPhrasesMissingInLocal.slice(0, 5);

    // Update state to start the gameplay
    setPhrasesToReview(selectedPhrases);
    setIsGameplayActive(true);
  };

  const resetGameplay = () => {
    setIsGameplayActive(false);
    setAllCardsReviewed(false);
    setProcessedPhrases([]);
    setPhrasesToReview([]);
    setCurrentPhraseIndex(0);
  };

  const markAsToReview = (phraseId: number, index: number, element: HTMLElement | null) => {
    if (!processedPhrases.includes(phraseId)) {
      setTimeout(() => {
        setProcessedPhrases((prevProcessedPhrases) => [...prevProcessedPhrases, phraseId]);
      }, 250);
    }
  };

  return {
    isGameplayActive,
    processedPhrases,
    phrasesToReview,
    currentPhraseIndex,
    allCardsReviewed,
    startGameplay,
    resetGameplay,
    markAsToReview
  };
}