import { useState, useEffect } from 'react';

/**
 * Key used for storing learned letters in localStorage
 * This ensures consistency across the application
 */
const LEARNED_LETTERS_KEY = 'learnedLetters';

/**
 * Custom hook to manage the user's progress in learning Georgian alphabet letters
 * Provides functions to add, check, and reset learned letters
 * Persists data in localStorage for persistence across sessions
 */
export const useLearnedLetters = () => {
  // State to track which letters have been learned (by their IDs)
  const [learnedLetters, setLearnedLetters] = useState<number[]>([]);
  // State to track the count of learned letters (for quick access)
  const [learnedCount, setLearnedCount] = useState<number>(0);

  /**
   * Load learned letters from localStorage when the component mounts
   * This ensures user progress is maintained across sessions
   */
  useEffect(() => {
    const stored = localStorage.getItem(LEARNED_LETTERS_KEY);
    if (stored) {
      const letters = JSON.parse(stored);
      setLearnedLetters(letters);
      setLearnedCount(letters.length);
    }
  }, []);

  /**
   * Adds a letter to the learned letters list
   * Updates both state and localStorage
   * @param letterId - The ID of the letter to mark as learned
   */
  const addLearnedLetter = (letterId: number) => {
    const updated = [...learnedLetters, letterId];
    setLearnedLetters(updated);
    setLearnedCount(updated.length);
    localStorage.setItem(LEARNED_LETTERS_KEY, JSON.stringify(updated));
  };

  /**
   * Resets all progress, clearing learned letters
   * Used when user wants to start over
   */
  const resetProgress = () => {
    setLearnedLetters([]);
    setLearnedCount(0);
    localStorage.removeItem(LEARNED_LETTERS_KEY);
  };

  /**
   * Checks if a specific letter has been learned
   * @param letterId - The ID of the letter to check
   * @returns boolean indicating whether the letter has been learned
   */
  const isLearned = (letterId: number): boolean => {
    return learnedLetters.includes(letterId);
  };

  return {
    learnedLetters,
    learnedCount,
    addLearnedLetter,
    resetProgress,
    isLearned,
  };
};