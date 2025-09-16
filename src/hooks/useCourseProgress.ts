'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'tbilingo-course-progress';

type CourseType = 'alphabet' | 'numbers';

interface ProgressData {
  learnedItems: number[];
  lastUpdated: string;
  totalItems: number;
  completionPercentage: number;
}

interface CourseProgress {
  [key: string]: ProgressData;
}

// Helper function to calculate completion percentage
const calculateCompletion = (learned: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((learned / total) * 100);
};

// Default progress data for a course
const defaultCourseData: ProgressData = {
  learnedItems: [],
  lastUpdated: new Date().toISOString(),
  totalItems: 0,
  completionPercentage: 0
};

/**
 * Custom hook to manage progress for different courses
 * @param courseType The type of course ('alphabet' or 'numbers')
 * @returns An object containing progress data and methods to update it
 * 
 * @example
 * const {
 *   progress,          // Current progress data
 *   isHydrated,        // Whether the data has been loaded from localStorage
 *   isLoading,         // Whether the data is being loaded
 *   addLearnedItem,    // Function to add a learned item
 *   removeLearnedItem, // Function to remove a learned item
 *   isItemLearned,     // Function to check if an item is learned
 *   resetProgress,     // Function to reset progress
 *   updateTotalItems,  // Function to update total items count
 * } = useCourseProgress('alphabet');
 */
export const useCourseProgress = (courseType: CourseType) => {
  const [state, setState] = useState<{
    progress: CourseProgress;
    isHydrated: boolean;
    isLoading: boolean;
  }>({
    progress: { [courseType]: { ...defaultCourseData } },
    isHydrated: false,
    isLoading: true,
  });

  const { progress, isHydrated, isLoading } = state;
  const isClient = typeof window !== 'undefined';
  
  const currentCourse = useMemo(
    () => (isHydrated ? progress[courseType] : { ...defaultCourseData }),
    [progress, courseType, isHydrated]
  );

  // Load progress from localStorage when the component mounts
  useEffect(() => {
    if (!isClient) return;

    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CourseProgress;
          
          // Ensure the course type exists in the progress object
          if (!parsed[courseType]) {
            parsed[courseType] = { ...defaultCourseData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
          
          setState(prev => ({
            ...prev,
            progress: parsed,
            isHydrated: true,
            isLoading: false,
          }));
        } else {
          // Initialize with default progress
          const initialProgress = {
            [courseType]: { ...defaultCourseData }
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
          
          setState(prev => ({
            ...prev,
            progress: initialProgress,
            isHydrated: true,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error loading progress:', error);
        setState(prev => ({
          ...prev,
          isHydrated: true,
          isLoading: false,
        }));
      }
    };

    loadProgress();
  }, [courseType, isClient]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoading || !isHydrated || !isClient) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [progress, isLoading, isHydrated, isClient]);

  // Add an item to the learned items list
  const addLearnedItem = useCallback((itemId: number) => {
    if (!isClient) return;

    setState(prev => {
      const currentCourse = prev.progress[courseType] || { ...defaultCourseData };
      
      // Don't add if already learned
      if (currentCourse.learnedItems.includes(itemId)) {
        return prev;
      }

      const newLearnedItems = [...currentCourse.learnedItems, itemId];
      const updatedCourse = {
        ...currentCourse,
        learnedItems: newLearnedItems,
        lastUpdated: new Date().toISOString(),
        completionPercentage: calculateCompletion(
          newLearnedItems.length, 
          currentCourse.totalItems
        )
      };

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseType]: updatedCourse
        }
      };
    });
  }, [courseType, isClient]);

  // Remove an item from the learned items list
  const removeLearnedItem = useCallback((itemId: number) => {
    if (!isClient) return;

    setState(prev => {
      const currentCourse = prev.progress[courseType];
      if (!currentCourse) return prev;

      const newLearnedItems = currentCourse.learnedItems.filter(id => id !== itemId);
      const updatedCourse = {
        ...currentCourse,
        learnedItems: newLearnedItems,
        lastUpdated: new Date().toISOString(),
        completionPercentage: calculateCompletion(
          newLearnedItems.length, 
          currentCourse.totalItems
        )
      };

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseType]: updatedCourse
        }
      };
    });
  }, [courseType, isClient]);

  // Check if an item is learned
  const isItemLearned = useCallback((itemId: number): boolean => {
    if (!isHydrated) return false;
    const course = progress[courseType];
    return course ? course.learnedItems.includes(itemId) : false;
  }, [progress, courseType, isHydrated]);

  // Reset progress for the current course
  const resetProgress = useCallback(() => {
    if (!isClient) return;

    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [courseType]: {
          ...defaultCourseData,
          totalItems: prev.progress[courseType]?.totalItems || 0,
          completionPercentage: 0
        }
      }
    }));
  }, [courseType, isClient]);

  // Update the total number of items in the course
  const updateTotalItems = useCallback((total: number) => {
    if (!isClient) return;

    setState(prev => {
      const currentCourse = prev.progress[courseType] || { ...defaultCourseData };
      
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [courseType]: {
            ...currentCourse,
            totalItems: total,
            completionPercentage: calculateCompletion(
              currentCourse.learnedItems.length, 
              total
            )
          }
        }
      };
    });
  }, [courseType, isClient]);

  // Get the current course's progress data
  const getCourseProgress = useCallback((): ProgressData => {
    return isHydrated 
      ? progress[courseType] || { ...defaultCourseData }
      : { ...defaultCourseData };
  }, [progress, courseType, isHydrated]);

  return {
    progress: currentCourse,
    isLoading,
    isHydrated,
    isClient,
    addLearnedItem,
    removeLearnedItem,
    isItemLearned,
    resetProgress,
    updateTotalItems,
    getCourseProgress,
  };
};

// Note: The useLearnedLetters hook is now a separate hook in useLearnedLetters.ts
