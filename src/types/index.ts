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

export interface PhraseItem {
  id: number;
  english: string;
  georgian: string;
  latin: string;
  fakeWords: string[];
}

export interface PhraseMemory {
  correctAnswers: number;
  isLearned: boolean;
}

// Level type definitions
export type LevelType = 'characters' | 'numbers' | 'words' | 'phrases';



// Component prop interfaces
export interface LevelLinkProps {
  href: string;
  title: string;
  icon: string;
  disabled: boolean;
  locked?: boolean; // Whether the level is locked (not yet unlocked)
  isCompleted?: boolean; // Whether the level is completed/passed
  progress?: number; // Percentage of completion (0-100)
  totalItems?: number; // Total number of items in the level
  completedItems?: number; // Number of completed items
  onLockedClick?: () => void; // Callback when locked level is clicked
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

export interface BasicWordsComponentProps {
  word: WordItem;
  onNext: () => void;
  onLearned: () => void;
}

export interface FlashcardWordProps {
  word: WordItem;
  onNext: () => void;
  onLearned: () => void;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showNumbers?: boolean;
  width?: string;
  height?: number;
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