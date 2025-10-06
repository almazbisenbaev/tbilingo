/**
 * Custom hooks for fetching learning content from Firebase
 * Replaces direct imports from static data files
 */

'use client';

import { useState, useEffect } from 'react';
import { LearningContentService, CourseType } from '@/services/firebase';
import { AlphabetItem, NumberItem, WordItem } from '@/types';

// Debug logging helper
const debugLog = (operation: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 LearningHooks ${operation}:`, data || '');
  }
};

// Generic learning data hook state
interface LearningDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching learning content
 */
function useLearningContent<T>(courseType: CourseType): LearningDataState<T> {
  const [state, setState] = useState<LearningDataState<T>>({
    data: [],
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const fetchData = async () => {
    try {
      debugLog(`Fetching ${courseType} data`);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await LearningContentService.getCourseItems<T>(courseType);
      
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null
      }));
      
      debugLog(`Successfully fetched ${data.length} ${courseType} items`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error fetching ${courseType} data:`, error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseType]);

  // Update refetch function
  useEffect(() => {
    setState(prev => ({
      ...prev,
      refetch: fetchData
    }));
  }, []);

  return state;
}

/**
 * Hook for fetching alphabet data
 */
export function useAlphabet(): LearningDataState<AlphabetItem> {
  debugLog('Using alphabet hook');
  return useLearningContent<AlphabetItem>('alphabet');
}

/**
 * Hook for fetching numbers data
 */
export function useNumbers(): LearningDataState<NumberItem> {
  debugLog('Using numbers hook');
  return useLearningContent<NumberItem>('numbers');
}

/**
 * Hook for fetching words data
 */
export function useWords(): LearningDataState<WordItem> {
  debugLog('Using words hook');
  return useLearningContent<WordItem>('words');
}

/**
 * Hook for fetching course metadata
 */
export function useCourseMetadata(courseType: CourseType) {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        debugLog(`Fetching ${courseType} metadata`);
        setLoading(true);
        setError(null);
        
        const data = await LearningContentService.getCourseMetadata(courseType);
        setMetadata(data);
        
        debugLog(`Successfully fetched ${courseType} metadata`, data);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error fetching ${courseType} metadata:`, error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [courseType]);

  return { metadata, loading, error };
}

