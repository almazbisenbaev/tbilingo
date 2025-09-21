export interface Letter {
  character: string;
  name: string;
  pronunciation: string;
  id: number;
  audioUrl: string;
}

export interface Number {
  id: number;
  number: string;
  translation: string;
  translationLatin: string;
}

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
  letter: Letter;
  onNext: () => void;
  onLearned: () => void;
}

export interface FlashcardNumberProps {
  number: Number;
  onNext: () => void;
  onLearned: () => void;
}

export interface ItemNumberProps {
  number: number
}

export interface PendingLearnedAction {
  characterId: number;
  index: number;
  element: HTMLElement | null;
}

export type FontType = 'sans' | 'serif';