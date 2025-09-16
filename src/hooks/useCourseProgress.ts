import { useState, useEffect, useCallback } from 'react';

type CourseType = 'alphabet' | 'numbers';

interface ProgressData {
  learnedItems: number[];
  lastUpdated: string;
}

interface CourseProgress {
  [key: string]: ProgressData;
}

const STORAGE_KEY = 'courseProgress';

/**
 * Custom hook to manage progress for different courses
 * @param courseType The type of course ('alphabet' or 'numbers')
 * @returns An object containing progress data and methods to update it
 */
export const useCourseProgress = (courseType: CourseType) => {
  const [progress, setProgress] = useState<CourseProgress>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage when the component mounts
  useEffect(() => {
    try {
      // Check for old format first (only for alphabet course)
      if (courseType === 'alphabet') {
        const oldProgress = localStorage.getItem('learnedLetters');
        if (oldProgress) {
          // Migrate old progress to new format
          const learnedItems = JSON.parse(oldProgress);
          const newProgress = {
            [courseType]: {
              learnedItems,
              lastUpdated: new Date().toISOString()
            }
          };
          // Save to new format
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
          // Remove old key
          localStorage.removeItem('learnedLetters');
          setProgress(newProgress);
          setIsLoading(false);
          return;
        }
      }

      // Check for new format
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure the course type exists in the progress object
        if (!parsed[courseType]) {
          parsed[courseType] = { learnedItems: [], lastUpdated: new Date().toISOString() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        setProgress(parsed);
      } else {
        // Initialize with empty progress for the course type if nothing in storage
        const initialProgress = {
          [courseType]: { learnedItems: [], lastUpdated: new Date().toISOString() }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
        setProgress(initialProgress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Initialize with empty progress if there's an error
      const initialProgress = {
        [courseType]: { learnedItems: [], lastUpdated: new Date().toISOString() }
      };
      setProgress(initialProgress);
    } finally {
      setIsLoading(false);
    }
  }, [courseType]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoading) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [progress, isLoading]);

  // Get the current course's progress data
  const getCourseProgress = useCallback((): ProgressData => {
    if (!progress[courseType]) {
      // Initialize if not exists
      const newProgress = {
        ...progress,
        [courseType]: { learnedItems: [], lastUpdated: new Date().toISOString() }
      };
      setProgress(newProgress);
      return newProgress[courseType];
    }
    return progress[courseType];
  }, [progress, courseType]);

  // Add an item to the learned items for the current course
  const addLearnedItem = useCallback((itemId: number) => {
    setProgress(prev => {
      const currentCourse = prev[courseType] || { learnedItems: [], lastUpdated: new Date().toISOString() };
      
      // Don't add duplicate items
      if (currentCourse.learnedItems.includes(itemId)) {
        return prev;
      }

      return {
        ...prev,
        [courseType]: {
          learnedItems: [...currentCourse.learnedItems, itemId],
          lastUpdated: new Date().toISOString()
        }
      };
    });
  }, [courseType]);

  // Check if an item is learned in the current course
  const isItemLearned = useCallback((itemId: number): boolean => {
    return getCourseProgress().learnedItems.includes(itemId);
  }, [getCourseProgress]);

  // Reset progress for the current course
  const resetProgress = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      [courseType]: {
        learnedItems: [],
        lastUpdated: new Date().toISOString()
      }
    }));
  }, [courseType]);

  // Get the count of learned items for the current course
  const getLearnedCount = useCallback((): number => {
    return getCourseProgress().learnedItems.length;
  }, [getCourseProgress]);

  return {
    isLoading,
    learnedCount: getLearnedCount(),
    isItemLearned,
    addLearnedItem,
    resetProgress,
    getProgress: getCourseProgress
  };
};

// For backward compatibility
export const useLearnedLetters = () => {
  const {
    learnedCount,
    isItemLearned,
    addLearnedItem,
    resetProgress,
    isLoading
  } = useCourseProgress('alphabet');

  return {
    learnedCount,
    isLetterLearned: isItemLearned,
    addLearnedLetter: addLearnedItem,
    resetProgress,
    isLoading
  };
};
