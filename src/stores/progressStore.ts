'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// Custom storage object that safely handles server-side rendering
const createSafeStorage = (): StateStorage => {
  return {
    getItem: (name: string): string | null => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    removeItem: (name: string): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    },
  };
};

// Define course types
export type CourseType = 'alphabet' | 'numbers' | 'phrases' | 'vocabulary';

// Define the structure for individual course progress
export interface CourseProgress {
  learnedItems: number[];
  lastUpdated: string;
  totalItems: number;
  completionPercentage: number;
}

// Define the overall progress state
export interface ProgressState {
  courses: Record<CourseType, CourseProgress>;
  // Actions
  initializeCourse: (courseType: CourseType, totalItems: number) => void;
  addLearnedItem: (courseType: CourseType, itemId: number) => void;
  removeLearnedItem: (courseType: CourseType, itemId: number) => void;
  isItemLearned: (courseType: CourseType, itemId: number) => boolean;
  resetCourseProgress: (courseType: CourseType) => void;
  resetAllProgress: () => void;
  getCourseProgress: (courseType: CourseType) => CourseProgress;
  getLearnedCount: (courseType: CourseType) => number;
}

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (learnedItems: number[], totalItems: number): number => {
  if (totalItems === 0) return 0;
  return Math.round((learnedItems.length / totalItems) * 100);
};

// Helper function to create default course progress
const createDefaultCourseProgress = (totalItems: number = 0): CourseProgress => ({
  learnedItems: [],
  lastUpdated: new Date().toISOString(),
  totalItems,
  completionPercentage: 0,
});

// Create the Zustand store with persistence
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initialize with empty courses - they'll be populated from localStorage
      courses: {
        alphabet: createDefaultCourseProgress(),
        numbers: createDefaultCourseProgress(),
        phrases: createDefaultCourseProgress(),
        vocabulary: createDefaultCourseProgress(),
      } as Record<CourseType, CourseProgress>,

      initializeCourse: (courseType: CourseType, totalItems: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType] || createDefaultCourseProgress();
          return {
            courses: {
              ...state.courses,
              [courseType]: {
                ...currentCourse,
                totalItems,
                completionPercentage: calculateCompletionPercentage(currentCourse.learnedItems, totalItems),
              },
            },
          };
        });
      },

      addLearnedItem: (courseType: CourseType, itemId: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType] || createDefaultCourseProgress();
          const learnedItems = [...new Set([...currentCourse.learnedItems, itemId])];
          
          return {
            courses: {
              ...state.courses,
              [courseType]: {
                ...currentCourse,
                learnedItems,
                lastUpdated: new Date().toISOString(),
                completionPercentage: calculateCompletionPercentage(
                  learnedItems,
                  currentCourse.totalItems
                ),
              },
            },
          };
        });
      },

      removeLearnedItem: (courseType: CourseType, itemId: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType];
          if (!currentCourse) return state;

          const learnedItems = currentCourse.learnedItems.filter((id) => id !== itemId);
          
          return {
            courses: {
              ...state.courses,
              [courseType]: {
                ...currentCourse,
                learnedItems,
                lastUpdated: new Date().toISOString(),
                completionPercentage: calculateCompletionPercentage(
                  learnedItems,
                  currentCourse.totalItems
                ),
              },
            },
          };
        });
      },

      isItemLearned: (courseType: CourseType, itemId: number) => {
        const state = get();
        const course = state.courses[courseType];
        return course ? course.learnedItems.includes(itemId) : false;
      },

      resetCourseProgress: (courseType: CourseType) => {
        set((state) => ({
          courses: {
            ...state.courses,
            [courseType]: createDefaultCourseProgress(state.courses[courseType]?.totalItems || 0),
          },
        }));
      },

      resetAllProgress: () => ({
        courses: {
          alphabet: createDefaultCourseProgress(),
          numbers: createDefaultCourseProgress(),
          phrases: createDefaultCourseProgress(),
          vocabulary: createDefaultCourseProgress(),
        },
      }),

      getCourseProgress: (courseType: CourseType) => {
        const state = get();
        return state.courses[courseType] || createDefaultCourseProgress();
      },

      getLearnedCount: (courseType: CourseType) => {
        const state = get();
        const course = state.courses[courseType];
        return course ? course.learnedItems.length : 0;
      },

       
    }),
    {
      name: 'tbilingo-progress',
      storage: createJSONStorage(() => createSafeStorage()),
      version: 1,
      // Remove skipHydration and handle it manually
      partialize: (state: ProgressState) => ({
        courses: state.courses,
      }),
      // Add migration logic in case of data structure changes
      migrate: (persistedState: any, version: number) => {
        // In the future, you can add migration logic here if needed
        return persistedState as ProgressState;
      },
      // Add a merge function to handle initial state
      merge: (persistedState: unknown, currentState: ProgressState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }
        
        const persistedCourses = (persistedState as { courses?: Record<CourseType, CourseProgress> }).courses;
        
        if (!persistedCourses) {
          return currentState;
        }
        
        return {
          ...currentState,
          courses: {
            alphabet: persistedCourses.alphabet || createDefaultCourseProgress(),
            numbers: persistedCourses.numbers || createDefaultCourseProgress(),
            phrases: persistedCourses.phrases || createDefaultCourseProgress(),
            vocabulary: persistedCourses.vocabulary || createDefaultCourseProgress(),
          }
        };
      },
    }
  )
);

// Custom hook to ensure the store is hydrated before using it
export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Custom hook to use the store with hydration check
export function useSafeProgressStore<U>(
  selector: (state: ProgressState) => U
): U | undefined {
  const store = useProgressStore(selector);
  const isHydrated = useStoreHydration();
  
  // Return undefined during SSR or before hydration
  return isHydrated ? store : undefined;
}