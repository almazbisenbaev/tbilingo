'use client';

import { useState, useEffect } from 'react';
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

// Simplified course progress - removed unused completedLessons
export interface CourseProgress {
  learnedItems: Set<string>;
}

// Progress state interface - removed unused methods
export interface ProgressState {
  // Data
  courses: Record<string, CourseProgress>;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions (only the ones actually used)
  initializeCourse: (courseId: string, totalItems: number) => void;
  addLearnedItem: (courseId: string, itemId: string) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  getLearnedCount: (courseId: string) => number;
  getCompletionPercentage: (courseId: string, totalItems: number) => number;
  setUser: (user: User | null) => void;
  loadUserProgress: () => Promise<void>;
}

// Helper function to create default course progress
const createDefaultCourseProgress = (): CourseProgress => ({
  learnedItems: new Set<string>(),
});

// Convert Firebase progress to internal format
const convertFirebaseProgress = (firebaseProgress: SimpleUserProgress | null): CourseProgress => {
  if (!firebaseProgress) return createDefaultCourseProgress();

  return {
    learnedItems: new Set(firebaseProgress.learnedItemIds || []),
  };
};

// Create the Zustand store
export const useProgressStore = create<ProgressState>((set, get) => ({
  // Initial state
  courses: {
    '1': createDefaultCourseProgress(),
    '2': createDefaultCourseProgress(),
    '3': createDefaultCourseProgress(),
    '4': createDefaultCourseProgress(),
    '5': createDefaultCourseProgress(),
  },
  user: null,
  isLoading: true,
  isHydrated: false,

  // Set current user
  setUser: (user: User | null) => {
    debugLog('Setting user', user?.uid);
    set({ user, isLoading: false });

    if (user) {
      get().loadUserProgress();
    } else {
      // Reset to default when user is null
      set({
        courses: {
          '1': createDefaultCourseProgress(),
          '2': createDefaultCourseProgress(),
          '3': createDefaultCourseProgress(),
          '4': createDefaultCourseProgress(),
          '5': createDefaultCourseProgress(),
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
      const courseIds = ['1', '2', '3', '4', '5'];
      const progressPromises = courseIds.map(async (courseId) => {
        const firebaseProgress = await SimpleUserProgressService.getUserProgress(courseId);
        return { courseId, progress: convertFirebaseProgress(firebaseProgress) };
      });

      const results = await Promise.all(progressPromises);

      const newCourses = { ...get().courses };
      results.forEach(({ courseId, progress }) => {
        newCourses[courseId] = progress;
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

  // Initialize course (simplified - no totalItems needed since we don't store it)
  initializeCourse: (courseId: string, totalItems: number) => {
    debugLog(`Initializing course ${courseId} with ${totalItems} items`);

    const state = get();
    if (!state.courses[courseId]) {
      set({
        courses: {
          ...state.courses,
          [courseId]: createDefaultCourseProgress(),
        },
      });
    }
  },

  // Add learned item
  addLearnedItem: async (courseId: string, itemId: string) => {
    try {
      debugLog(`Adding learned item ${itemId} to ${courseId}`);

      const state = get();
      const currentCourse = state.courses[courseId] || createDefaultCourseProgress();

      // Don't add if already learned
      if (currentCourse.learnedItems.has(itemId)) {
        debugLog(`Item ${itemId} already learned for ${courseId}`);
        return;
      }

      const newLearnedItems = new Set(currentCourse.learnedItems);
      newLearnedItems.add(itemId);

      // Update local state
      set({
        courses: {
          ...state.courses,
          [courseId]: { learnedItems: newLearnedItems },
        },
      });

      // Update Firebase if user is authenticated
      if (state.user) {
        await SimpleUserProgressService.addLearnedItem(courseId, itemId);
      }

      debugLog(`Successfully added learned item ${itemId} to ${courseId}`);

    } catch (error) {
      console.error(`❌ Error adding learned item ${itemId} to ${courseId}:`, error);
    }
  },

  // Reset all progress
  resetAllProgress: async () => {
    try {
      debugLog('Resetting all progress');

      const defaultCourses = {
        '1': createDefaultCourseProgress(),
        '2': createDefaultCourseProgress(),
        '3': createDefaultCourseProgress(),
        '4': createDefaultCourseProgress(),
        '5': createDefaultCourseProgress(),
      };

      set({ courses: defaultCourses });

      // Reset Firebase progress for all courses
      const state = get();
      if (state.user) {
        const courseIds = ['1', '2', '3', '4', '5'];
        await Promise.all(
          courseIds.map(courseId =>
            SimpleUserProgressService.resetCourseProgress(courseId)
          )
        );
      }

      debugLog('Successfully reset all progress');

    } catch (error) {
      console.error('❌ Error resetting all progress:', error);
    }
  },

  // Get learned count
  getLearnedCount: (courseId: string) => {
    const state = get();
    const course = state.courses[courseId];
    return course ? course.learnedItems.size : 0;
  },

  // Get completion percentage
  getCompletionPercentage: (courseId: string, totalItems: number) => {
    const state = get();
    const course = state.courses[courseId];
    if (!course || totalItems === 0) return 0;

    const learnedCount = course.learnedItems.size;
    return Math.round((learnedCount / totalItems) * 100);
  },
}));

// Simplified hydration hook
export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const storeHydrated = useProgressStore(state => state.isHydrated);

  useEffect(() => {
    setIsHydrated(storeHydrated);
  }, [storeHydrated]);

  return isHydrated;
}

// Safe progress store hook (returns undefined during SSR)
export function useSafeProgressStore<U>(
  selector: (state: ProgressState) => U
): U | undefined {
  const store = useProgressStore(selector);
  const isHydrated = useStoreHydration();

  return isHydrated ? store : undefined;
}

// Auth state listener hook
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