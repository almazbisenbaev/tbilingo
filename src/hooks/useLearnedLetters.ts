'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Key used for storing learned letters in localStorage
 * This ensures consistency across the application
 */
const LEARNED_LETTERS_KEY = 'learnedLetters';

/**
 * Custom hook to manage the user's progress in learning Georgian alphabet letters
 * Provides functions to add, check, and reset learned letters
 * Persists data in localStorage for persistence across sessions
 * 
 * @example
 * const {
 *   learnedLetters,  // Array of learned letter IDs
 *   learnedCount,    // Number of learned letters
 *   isLetterLearned, // Function to check if a letter is learned
 *   addLearnedLetter, // Function to add a letter to learned
 *   resetProgress,    // Function to reset progress
 *   isClient          // Boolean indicating if we're on the client
 * } = useLearnedLetters();
 */
export const useLearnedLetters = () => {
  const [state, setState] = useState<{
    learnedLetters: number[];
    isHydrated: boolean;
  }>({
    learnedLetters: [],
    isHydrated: false,
  });
  
  const { learnedLetters, isHydrated } = state;
  const learnedCount = learnedLetters.length;
  const isClient = typeof window !== 'undefined';

  // Load learned letters from localStorage when the component mounts
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const stored = localStorage.getItem(LEARNED_LETTERS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      
      setState(prev => ({
        ...prev,
        learnedLetters: Array.isArray(parsed) ? parsed : [],
        isHydrated: true
      }));
    } catch (error) {
      console.error('Failed to load learned letters:', error);
      setState(prev => ({
        ...prev,
        isHydrated: true
      }));
    }
  }, [isClient]);

  /**
   * Adds a letter to the learned letters list
   * Updates both state and localStorage
   * @param letterId - The ID of the letter to mark as learned
   */
  const addLearnedLetter = useCallback((letterId: number) => {
    if (!isClient) return;
    
    setState(prev => {
      const updated = [...new Set([...prev.learnedLetters, letterId])];
      
      try {
        localStorage.setItem(LEARNED_LETTERS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        return prev; // Don't update state if localStorage fails
      }
      
      return {
        ...prev,
        learnedLetters: updated
      };
    });
  }, [isClient]);

  /**
   * Checks if a specific letter has been learned
   * @param letterId - The ID of the letter to check
   * @returns boolean - True if the letter has been learned, false otherwise
   */
  const isLetterLearned = useCallback((letterId: number): boolean => {
    return isClient && learnedLetters.includes(letterId);
  }, [isClient, learnedLetters]);

  /**
   * Resets all learned letters
   * Useful for testing or allowing users to start over
   */
  const resetProgress = useCallback(() => {
    if (!isClient) return;
    
    setState(prev => ({
      ...prev,
      learnedLetters: []
    }));
    
    try {
      localStorage.removeItem(LEARNED_LETTERS_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [isClient]);

  return {
    learnedLetters: isHydrated ? learnedLetters : [],
    learnedCount: isHydrated ? learnedCount : 0,
    addLearnedLetter,
    isLetterLearned,
    resetProgress,
    isClient,
    isHydrated
  };
};