'use client';

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { UserProgressService, CourseType as FirebaseCourseType, UserProgress } from '@/services/firebase';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ProgressStore ${operation}:`, data || '');
  }
};

// Local course types (keeping for backward compatibility)
export type CourseType = 'alphabet' | 'numbers' | 'words' | 'phrases' | 'vocabulary';

// Course progress interface
export interface CourseProgress {
  learnedItems: number[];
  lastUpdated: string;
  totalItems: number;
  completionPercentage: number;
}

// Progress state interface
export interface ProgressState {
  // Data
  courses: Record<CourseType, CourseProgress>;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  initializeCourse: (courseType: CourseType, totalItems: number) => Promise<void>;
  addLearnedItem: (courseType: CourseType, itemId: number) => Promise<void>;
  removeLearnedItem: (courseType: CourseType, itemId: number) => Promise<void>;
  isItemLearned: (courseType: CourseType, itemId: number) => boolean;
  resetCourseProgress: (courseType: CourseType) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  getCourseProgress: (courseType: CourseType) => CourseProgress;
  getLearnedCount: (courseType: CourseType) => number;
  setUser: (user: User | null) => void;
  loadUserProgress: () => Promise<void>;
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

// Convert Firebase course type to local course type
const mapCourseType = (courseType: CourseType): FirebaseCourseType | null => {
  const validTypes: FirebaseCourseType[] = ['alphabet', 'numbers', 'words'];
  return validTypes.includes(courseType as FirebaseCourseType) ? courseType as FirebaseCourseType : null;
};

// Convert Firebase UserProgress to local CourseProgress
const convertFirebaseProgress = (firebaseProgress: UserProgress | null): CourseProgress => {
  if (!firebaseProgress) {
    return createDefaultCourseProgress();
  }
  
  return {
    learnedItems: firebaseProgress.learnedItems || [],
    lastUpdated: firebaseProgress.lastUpdated ? new Date(firebaseProgress.lastUpdated.toDate()).toISOString() : new Date().toISOString(),
    totalItems: firebaseProgress.totalItems || 0,
    completionPercentage: firebaseProgress.completionPercentage || 0,
  };
};

// Create the Zustand store
export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  courses: {
    alphabet: createDefaultCourseProgress(),
    numbers: createDefaultCourseProgress(),
    words: createDefaultCourseProgress(),
    phrases: createDefaultCourseProgress(),
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
      const supportedCourses: CourseType[] = ['alphabet', 'numbers', 'words'];
      const progressPromises = supportedCourses.map(async (courseType) => {
        const firebaseCourseType = mapCourseType(courseType);
        if (firebaseCourseType) {
          const firebaseProgress = await UserProgressService.getUserProgress(firebaseCourseType);
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
        totalItems,
        completionPercentage: calculateCompletionPercentage(currentCourse.learnedItems, totalItems),
      };

      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseType = mapCourseType(courseType);
      if (state.user && firebaseCourseType) {
        await UserProgressService.updateUserProgress(firebaseCourseType, {
          totalItems,
          completionPercentage: updatedCourse.completionPercentage
        });
      }

      debugLog(`Course ${courseType} initialized successfully`);

    } catch (error) {
      console.error(`❌ Error initializing course ${courseType}:`, error);
    }
  },

  // Add learned item
  addLearnedItem: async (courseType: CourseType, itemId: number) => {
    try {
      debugLog(`Adding learned item ${itemId} to ${courseType}`);

      const state = get();
      const currentCourse = state.courses[courseType] || createDefaultCourseProgress();
      
      // Don't add if already learned
      if (currentCourse.learnedItems.includes(itemId)) {
        debugLog(`Item ${itemId} already learned for ${courseType}`);
        return;
      }

      const learnedItems = [...currentCourse.learnedItems, itemId];
      const updatedCourse = {
        ...currentCourse,
        learnedItems,
        lastUpdated: new Date().toISOString(),
        completionPercentage: calculateCompletionPercentage(learnedItems, currentCourse.totalItems),
      };

      // Update local state
      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseType = mapCourseType(courseType);
      if (state.user && firebaseCourseType) {
        await UserProgressService.addLearnedItem(firebaseCourseType, itemId);
      }

      debugLog(`Successfully added learned item ${itemId} to ${courseType}`);

    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseType}:`, error);
    }
  },

  // Remove learned item
  removeLearnedItem: async (courseType: CourseType, itemId: number) => {
    try {
      debugLog(`Removing learned item ${itemId} from ${courseType}`);

      const state = get();
      const currentCourse = state.courses[courseType];
      if (!currentCourse) return;

      const learnedItems = currentCourse.learnedItems.filter((id) => id !== itemId);
      const updatedCourse = {
        ...currentCourse,
        learnedItems,
        lastUpdated: new Date().toISOString(),
        completionPercentage: calculateCompletionPercentage(learnedItems, currentCourse.totalItems),
      };

      // Update local state
      set({
        courses: {
          ...state.courses,
          [courseType]: updatedCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseType = mapCourseType(courseType);
      if (state.user && firebaseCourseType) {
        await UserProgressService.removeLearnedItem(firebaseCourseType, itemId);
      }

      debugLog(`Successfully removed learned item ${itemId} from ${courseType}`);

    } catch (error) {
      console.error(`❌ Error removing learned item ${itemId} from ${courseType}:`, error);
    }
  },

  // Check if item is learned
  isItemLearned: (courseType: CourseType, itemId: number) => {
    const state = get();
    const course = state.courses[courseType];
    const isLearned = course ? course.learnedItems.includes(itemId) : false;
    debugLog(`Item ${itemId} learned status for ${courseType}:`, isLearned);
    return isLearned;
  },

  // Reset course progress
  resetCourseProgress: async (courseType: CourseType) => {
    try {
      debugLog(`Resetting progress for ${courseType}`);

      const state = get();
      const totalItems = state.courses[courseType]?.totalItems || 0;
      
      const resetCourse = createDefaultCourseProgress(totalItems);

      set({
        courses: {
          ...state.courses,
          [courseType]: resetCourse,
        },
      });

      // Update Firebase if user is authenticated and this is a supported course
      const firebaseCourseType = mapCourseType(courseType);
      if (state.user && firebaseCourseType) {
        await UserProgressService.resetCourseProgress(firebaseCourseType);
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
        vocabulary: createDefaultCourseProgress(),
      };

      set({ courses: defaultCourses });

      // Reset Firebase progress for supported courses
      const state = get();
      if (state.user) {
        const supportedCourses: FirebaseCourseType[] = ['alphabet', 'numbers', 'words'];
        await Promise.all(
          supportedCourses.map(courseType => 
            UserProgressService.resetCourseProgress(courseType)
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
    const count = course ? course.learnedItems.length : 0;
    debugLog(`Learned count for ${courseType}:`, count);
    return count;
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