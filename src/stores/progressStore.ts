'use client';

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { SimpleUserProgressService, SimpleUserProgress } from '@/services/simpleUserProgress';
import { auth } from '@root/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ProgressStore ${operation}:`, data || '');
  }
};

// Local course types (keeping for backward compatibility)
export type CourseType = 'alphabet' | 'numbers' | 'words' | 'phrases' | '4' | 'phrases-2' | 'vocabulary' | string;

// Course progress interface
export interface CourseProgress {
  learnedItems: Set<string>;
  completedLessons: Set<string>;
}

// Progress state interface
export interface ProgressState {
  // Data
  courses: Record<string, CourseProgress>;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  initializeCourse: (courseType: CourseType, totalItems: number) => Promise<void>;
  addLearnedItem: (courseType: CourseType, itemId: string) => Promise<void>;
  removeLearnedItem: (courseType: CourseType, itemId: string) => Promise<void>;
  isItemLearned: (courseType: CourseType, itemId: string) => boolean;
  resetCourseProgress: (courseType: CourseType) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  getCourseProgress: (courseType: CourseType) => CourseProgress;
  getLearnedCount: (courseType: CourseType) => number;
  getCompletionPercentage: (courseType: CourseType, totalItems: number) => number;
  setUser: (user: User | null) => void;
  loadUserProgress: () => Promise<void>;
}

// Helper function to calculate completion percentage
// Helper function to create default course progress
    const createDefaultCourseProgress = (): CourseProgress => ({
      learnedItems: new Set<string>(),
      completedLessons: new Set<string>(),
    });

// Convert local course type to Firebase course ID
const mapCourseType = (courseType: CourseType): string | null => {
  const courseMapping: Record<string, string> = {
    'alphabet': 'alphabet',
    'numbers': 'numbers', 
    'words': 'phrases-1',  // Note: words course uses phrases-1 ID
    'phrases': 'phrases-1',
    '4': 'phrases-2',  // Course 4 learning data uses '4', but progress uses 'phrases-2'
    'phrases-2': 'phrases-2',
    'vocabulary': 'vocabulary'
  };
  
  // If it's a known mapping, use it, otherwise use the courseType as-is
  return courseMapping[courseType] || courseType;
};

    // Convert Firebase progress to our internal format
    const convertFirebaseProgress = (firebaseProgress: SimpleUserProgress | null): CourseProgress => {
      if (!firebaseProgress) return createDefaultCourseProgress();
      
      return {
        learnedItems: new Set(firebaseProgress.learnedItemIds || []),
        completedLessons: new Set(), // New structure doesn't track lessons yet
      };
    };// Create the Zustand store
export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state - start with base courses, will be extended dynamically
  courses: {
    alphabet: createDefaultCourseProgress(),
    numbers: createDefaultCourseProgress(),
    words: createDefaultCourseProgress(),
    phrases: createDefaultCourseProgress(),
    '4': createDefaultCourseProgress(),
    'phrases-2': createDefaultCourseProgress(),
    vocabulary: createDefaultCourseProgress(),
  },
  user: null,
  isLoading: true,
  isHydrated: false,

  // Set current user
  setUser: (user: User | null) => {
    debugLog('Setting user', user?.uid);
    set({ user, isLoading: false });
    
    // Load user progress when user is set
    if (user) {
      get().loadUserProgress();
    } else {
      // Reset to default when user is null
      set({
        courses: {
          alphabet: createDefaultCourseProgress(),
          numbers: createDefaultCourseProgress(),
          words: createDefaultCourseProgress(),
          phrases: createDefaultCourseProgress(),
          '4': createDefaultCourseProgress(),
          'phrases-2': createDefaultCourseProgress(),
          vocabulary: createDefaultCourseProgress(),
        },
        isHydrated: true
      });
    }
  },

  // Load user progress from Firebase
  loadUserProgress: async () => {
    try {
      const { user } = get();
      if (!user) {
        debugLog('No user found, skipping progress load');
        return;
      }

      debugLog('Loading user progress from Firebase');
      set({ isLoading: true });

      // Load progress for all supported courses
      const supportedCourses: CourseType[] = ['alphabet', 'numbers', 'words', '4', 'phrases-2'];
      const progressPromises = supportedCourses.map(async (courseType) => {
        const firebaseCourseId = mapCourseType(courseType);
        if (firebaseCourseId) {
          const firebaseProgress = await SimpleUserProgressService.getUserProgress(firebaseCourseId);
          return { courseType, progress: convertFirebaseProgress(firebaseProgress) };
        }
        return { courseType, progress: createDefaultCourseProgress() };
      });

      const results = await Promise.all(progressPromises);
      
      const newCourses = { ...get().courses };
      results.forEach(({ courseType, progress }) => {
        newCourses[courseType] = progress;
      });

      set({
        courses: newCourses,
        isLoading: false,
        isHydrated: true
      });

      debugLog('User progress loaded successfully', newCourses);

    } catch (error) {
      console.error('❌ Error loading user progress:', error);
      set({ isLoading: false, isHydrated: true });
    }
  },

  // Initialize course
  initializeCourse: async (courseType: CourseType, totalItems: number) => {
    try {
      debugLog(`Initializing course ${courseType} with ${totalItems} items`);
      
      const state = get();
      const currentCourse = state.courses[courseType] || createDefaultCourseProgress();
      
      const updatedCourse = {
        ...currentCourse,
      };

      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // No Firebase update needed - will be handled by individual item operations

      debugLog(`Course ${courseType} initialized successfully`);

    } catch (error) {
      console.error(`❌ Error initializing course ${courseType}:`, error);
    }
  },

  // Add learned item
  addLearnedItem: async (courseType: CourseType, itemId: string) => {
    try {
      debugLog(`Adding learned item ${itemId} to ${courseType}`);

      const state = get();
      const currentCourse = state.courses[courseType] || createDefaultCourseProgress();
      
      // Don't add if already learned
      if (currentCourse.learnedItems.has(itemId)) {
        debugLog(`Item ${itemId} already learned for ${courseType}`);
        return;
      }

      const newLearnedItems = new Set(currentCourse.learnedItems);
      newLearnedItems.add(itemId);
      const updatedCourse = {
        ...currentCourse,
        learnedItems: newLearnedItems,
      };

      // Update local state
      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseId = mapCourseType(courseType);
      if (state.user && firebaseCourseId) {
        await SimpleUserProgressService.addLearnedItem(firebaseCourseId, itemId);
      }

      debugLog(`Successfully added learned item ${itemId} to ${courseType}`);

    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseType}:`, error);
    }
  },

  // Remove learned item
  removeLearnedItem: async (courseType: CourseType, itemId: string) => {
    try {
      debugLog(`Removing learned item ${itemId} from ${courseType}`);

      const state = get();
      const currentCourse = state.courses[courseType];
      if (!currentCourse) return;

      const newLearnedItems = new Set(currentCourse.learnedItems);
      newLearnedItems.delete(itemId);
      const updatedCourse = {
        ...currentCourse,
        learnedItems: newLearnedItems,
      };

      // Update local state
      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseId = mapCourseType(courseType);
      if (state.user && firebaseCourseId) {
        await SimpleUserProgressService.removeLearnedItem(firebaseCourseId, itemId);
      }

      debugLog(`Successfully removed learned item ${itemId} from ${courseType}`);

    } catch (error) {
      console.error(`❌ Error removing learned item ${itemId} from ${courseType}:`, error);
    }
  },

  // Check if item is learned
  isItemLearned: (courseType: CourseType, itemId: string) => {
    const state = get();
    const course = state.courses[courseType];
    const isLearned = course ? course.learnedItems.has(itemId) : false;
    debugLog(`Item ${itemId} learned status for ${courseType}:`, isLearned);
    return isLearned;
  },

  // Reset course progress
  resetCourseProgress: async (courseType: CourseType) => {
    try {
      debugLog(`Resetting progress for ${courseType}`);

      const state = get();
      const resetCourse = createDefaultCourseProgress();      set({
        courses: {
          ...state.courses,
          [courseType]: resetCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseId = mapCourseType(courseType);
      if (state.user && firebaseCourseId) {
        await SimpleUserProgressService.resetCourseProgress(firebaseCourseId);
      }

      debugLog(`Successfully reset progress for ${courseType}`);

    } catch (error) {
      console.error(`❌ Error resetting progress for ${courseType}:`, error);
    }
  },

  // Reset all progress
  resetAllProgress: async () => {
    try {
      debugLog('Resetting all progress');

      const defaultCourses = {
        alphabet: createDefaultCourseProgress(),
        numbers: createDefaultCourseProgress(),
        words: createDefaultCourseProgress(),
        phrases: createDefaultCourseProgress(),
        '4': createDefaultCourseProgress(),
        'phrases-2': createDefaultCourseProgress(),
        vocabulary: createDefaultCourseProgress(),
      };

      set({ courses: defaultCourses });

      // Reset Firebase progress for supported courses
      const state = get();
      if (state.user) {
        const supportedCourses: string[] = ['alphabet', 'numbers', 'words', 'phrases-2'];
        await Promise.all(
          supportedCourses.map(courseId => 
            SimpleUserProgressService.resetCourseProgress(courseId)
          )
        );
      }

      debugLog('Successfully reset all progress');

    } catch (error) {
      console.error('❌ Error resetting all progress:', error);
    }
  },

  // Get course progress
  getCourseProgress: (courseType: CourseType) => {
    const state = get();
    const progress = state.courses[courseType] || createDefaultCourseProgress();
    debugLog(`Getting progress for ${courseType}`, progress);
    return progress;
  },

  // Get learned count
  getLearnedCount: (courseType: CourseType) => {
    const state = get();
    const course = state.courses[courseType];
    const count = course ? course.learnedItems.size : 0;
    debugLog(`Learned count for ${courseType}:`, count);
    return count;
  },

  // Get completion percentage for a course
  getCompletionPercentage: (courseType: CourseType, totalItems: number) => {
    const state = get();
    const course = state.courses[courseType];
    if (!course || totalItems === 0) return 0;
    const learnedCount = course.learnedItems.size;
    const percentage = Math.round((learnedCount / totalItems) * 100);
    debugLog(`Completion percentage for ${courseType}:`, percentage);
    return percentage;
  },


}));

// Custom hook to ensure the store is hydrated before using it
export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const storeHydrated = useProgressStore(state => state.isHydrated);

  useEffect(() => {
    setIsHydrated(storeHydrated);
  }, [storeHydrated]);

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

// Auth state listener hook - should be used in the root component
export function useAuthStateListener() {
  const setUser = useProgressStore(state => state.setUser);

  useEffect(() => {
    debugLog('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      debugLog('Auth state changed', user?.uid);
      setUser(user);
    });

    return unsubscribe;
  }, [setUser]);
}