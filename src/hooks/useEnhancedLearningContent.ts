/**
 * Enhanced hooks for the new Firebase structure
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnhancedFirebaseService, CourseDefinition, CourseItem } from '@/services/enhancedFirebase';
import { AlphabetItem, NumberItem, WordItem } from '@/types';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 EnhancedHooks ${operation}:`, data || '');
  }
};

// Generic hook state
interface CourseDataState<T> {
  course: CourseDefinition | null;
  items: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching course data
 */
function useCourseData<T>(courseId: string): CourseDataState<T> {
  const [state, setState] = useState<CourseDataState<T>>({
    course: null,
    items: [],
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const fetchData = useCallback(async () => {
    try {
      debugLog(`Fetching course data for ${courseId}`);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch course definition and items in parallel
      const [course, items] = await Promise.all([
        EnhancedFirebaseService.getCourse(courseId),
        EnhancedFirebaseService.getCourseItems(courseId)
      ]);
      
      setState(prev => ({
        ...prev,
        course,
        items: items as T[],
        loading: false,
        error: null
      }));
      
      debugLog(`Successfully fetched ${courseId} data`, { 
        course: course?.title, 
        itemCount: items.length 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error fetching ${courseId} data:`, error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update refetch function
  useEffect(() => {
    setState(prev => ({
      ...prev,
      refetch: fetchData
    }));
  }, [fetchData]);

  return state;
}

/**
 * Hook for Georgian Alphabet course
 */
export function useAlphabet(): CourseDataState<AlphabetItem> {
  debugLog('Using enhanced alphabet hook');
  
  const result = useCourseData<AlphabetItem>('alphabet');
  
  // Transform the data to match the expected AlphabetItem interface
  const transformedItems = result.items.map(item => ({
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
    character: (item as any).character,
    name: (item as any).name,
    pronunciation: (item as any).pronunciation,
    audioUrl: (item as any).audioUrl
  }));

  return {
    ...result,
    items: transformedItems
  };
}

/**
 * Hook for Georgian Numbers course
 */
export function useNumbers(): CourseDataState<NumberItem> {
  debugLog('Using enhanced numbers hook');
  
  const result = useCourseData<NumberItem>('numbers');
  
  // Transform the data to match the expected NumberItem interface
  const transformedItems = result.items.map(item => ({
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
    number: (item as any).number,
    translation: (item as any).translation,
    translationLatin: (item as any).translationLatin
  }));

  return {
    ...result,
    items: transformedItems
  };
}

/**
 * Hook for Basic Georgian Words/Phrases course
 */
export function useWords(): CourseDataState<WordItem> {
  debugLog('Using enhanced words hook');
  
  const result = useCourseData<WordItem>('phrases-1');
  
  // Transform the data to match the expected WordItem interface
  const transformedItems = result.items.map(item => ({
    id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
    english: (item as any).english,
    georgian: (item as any).georgian,
    latin: (item as any).latin
  }));

  return {
    ...result,
    items: transformedItems
  };
}

/**
 * Hook for all available courses
 */
export function useAllCourses() {
  const [courses, setCourses] = useState<CourseDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        debugLog('Fetching all courses');
        setLoading(true);
        setError(null);
        
        const allCourses = await EnhancedFirebaseService.getAllCourses();
        setCourses(allCourses);
        
        debugLog(`Successfully fetched ${allCourses.length} courses`, allCourses);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching all courses:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
}

