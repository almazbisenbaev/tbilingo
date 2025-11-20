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

export interface PhraseAdvancedItem {
  id: number;
  english: string;
  georgian: string;
}

export interface PhraseAdvancedMemory {
  correctAnswers: number;
  isLearned: boolean;
}

// Progress tracking interfaces
export interface CourseProgress {
  learnedItems: Set<string>;  // Changed to Set of strings to match new structure
  completedLessons: Set<string>;
}

export interface ProgressData {
  alphabet: number[];
  numbers: number[];
  words: number[];
}

// Course type definitions
export type CourseType = 'flashcards' | 'words' | 'phrases' | 'phrases-2' | 'vocabulary';

// Component prop interfaces
export interface CourseLinkProps {
  href: string;
  title: string;
  icon: string;
  disabled: boolean;
  locked?: boolean; // Whether the course is locked (not yet unlocked)
  progress?: number; // Percentage of completion (0-100)
  totalItems?: number; // Total number of items in the course
  completedItems?: number; // Number of completed items
  onLockedClick?: () => void; // Callback when locked course is clicked
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
  showNumbers?: boolean;
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

export interface PendingPhraseAdvancedAction {
  phraseId: number;
  index: number;
  element: HTMLElement | null;
}

export interface PendingNumberAction {
  numberId: number;
  index: number;
  element: HTMLElement | null;
}

// App configuration types