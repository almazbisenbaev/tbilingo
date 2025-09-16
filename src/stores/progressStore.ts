import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      courses: {
        alphabet: createDefaultCourseProgress(),
        numbers: createDefaultCourseProgress(),
        phrases: createDefaultCourseProgress(),
        vocabulary: createDefaultCourseProgress(),
      },

      initializeCourse: (courseType: CourseType, totalItems: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType];
          return {
            courses: {
              ...state.courses,
              [courseType]: {
                ...currentCourse,
                totalItems,
                completionPercentage: calculateCompletionPercentage(
                  currentCourse.learnedItems,
                  totalItems
                ),
              },
            },
          };
        });
      },

      addLearnedItem: (courseType: CourseType, itemId: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType];
          
          // Don't add if already learned
          if (currentCourse.learnedItems.includes(itemId)) {
            return state;
          }

          const newLearnedItems = [...currentCourse.learnedItems, itemId];
          const updatedCourse: CourseProgress = {
            ...currentCourse,
            learnedItems: newLearnedItems,
            lastUpdated: new Date().toISOString(),
            completionPercentage: calculateCompletionPercentage(
              newLearnedItems,
              currentCourse.totalItems
            ),
          };

          return {
            courses: {
              ...state.courses,
              [courseType]: updatedCourse,
            },
          };
        });
      },

      removeLearnedItem: (courseType: CourseType, itemId: number) => {
        set((state) => {
          const currentCourse = state.courses[courseType];
          const newLearnedItems = currentCourse.learnedItems.filter(id => id !== itemId);
          
          const updatedCourse: CourseProgress = {
            ...currentCourse,
            learnedItems: newLearnedItems,
            lastUpdated: new Date().toISOString(),
            completionPercentage: calculateCompletionPercentage(
              newLearnedItems,
              currentCourse.totalItems
            ),
          };

          return {
            courses: {
              ...state.courses,
              [courseType]: updatedCourse,
            },
          };
        });
      },

      isItemLearned: (courseType: CourseType, itemId: number) => {
        const state = get();
        return state.courses[courseType].learnedItems.includes(itemId);
      },

      resetCourseProgress: (courseType: CourseType) => {
        set((state) => {
          const currentCourse = state.courses[courseType];
          return {
            courses: {
              ...state.courses,
              [courseType]: {
                ...currentCourse,
                learnedItems: [],
                lastUpdated: new Date().toISOString(),
                completionPercentage: 0,
              },
            },
          };
        });
      },

      resetAllProgress: () => {
        set((state) => {
          const resetCourses: Record<CourseType, CourseProgress> = {} as Record<CourseType, CourseProgress>;
          
          Object.keys(state.courses).forEach((courseType) => {
            const course = state.courses[courseType as CourseType];
            resetCourses[courseType as CourseType] = {
              ...course,
              learnedItems: [],
              lastUpdated: new Date().toISOString(),
              completionPercentage: 0,
            };
          });

          return { courses: resetCourses };
        });
      },

      getCourseProgress: (courseType: CourseType) => {
        const state = get();
        return state.courses[courseType];
      },

      getLearnedCount: (courseType: CourseType) => {
        const state = get();
        return state.courses[courseType].learnedItems.length;
      },

      
    }),
    {
      name: 'tbilingo-progress',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);