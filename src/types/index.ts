// Core data structure interfaces
export interface AlphabetItem {
  id: number;
  character: string;
  name: string;
  pronunciation: string;
  audioUrl: string;
}

export interface NumberItem {
  id: number;
  number: string;
  translation: string;
  translationLatin: string;
}

export interface WordItem {
  id: number;
  english: string;
  georgian: string;
  latin: string;
}

// Progress tracking interfaces
export interface CourseProgress {
  learnedItems: number[];
  lastUpdated: string;
  totalItems: number;
  completionPercentage: number;
}

export interface ProgressData {
  alphabet: number[];
  numbers: number[];
  words: number[];
}

// Course type definitions
export type CourseType = 'alphabet' | 'numbers' | 'words' | 'phrases' | 'vocabulary';

// Component prop interfaces
export interface CourseLinkProps {
  href: string;
  title: string;
  icon: string;
  disabled: boolean;
  progress?: number; // Percentage of completion (0-100)
  totalItems?: number; // Total number of items in the course
  completedItems?: number; // Number of completed items
}

export interface FlashcardProps {
  letter: AlphabetItem;
  onNext: () => void;
  onLearned: () => void;
}

export interface FlashcardNumberProps {
  number: NumberItem;
  onNext: () => void;
  onLearned: () => void;
}

export interface WordsComponentProps {
  word: WordItem;
  onNext: () => void;
  onLearned: () => void;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  width?: string;
}

// Utility interfaces
export interface ItemNumberProps {
  number: number
}

export interface PendingLearnedAction {
  characterId: number;
  index: number;
  element: HTMLElement | null;
}

export interface PendingWordAction {
  wordId: number;
  index: number;
  element: HTMLElement | null;
}

export interface PendingNumberAction {
  numberId: number;
  index: number;
  element: HTMLElement | null;
}

// App configuration types
export type FontType = 'sans' | 'serif';