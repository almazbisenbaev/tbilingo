import { useState, useEffect } from 'react';

const LEARNED_LETTERS_KEY = 'learnedLetters';

export const useLearnedLetters = () => {
  const [learnedLetters, setLearnedLetters] = useState<number[]>([]);
  const [learnedCount, setLearnedCount] = useState<number>(0);

  // Load learned letters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LEARNED_LETTERS_KEY);
    if (stored) {
      const letters = JSON.parse(stored);
      setLearnedLetters(letters);
      setLearnedCount(letters.length);
    }
  }, []);

  const addLearnedLetter = (letterId: number) => {
    const updated = [...learnedLetters, letterId];
    setLearnedLetters(updated);
    setLearnedCount(updated.length);
    localStorage.setItem(LEARNED_LETTERS_KEY, JSON.stringify(updated));
  };

  const resetProgress = () => {
    setLearnedLetters([]);
    setLearnedCount(0);
    localStorage.removeItem(LEARNED_LETTERS_KEY);
  };

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