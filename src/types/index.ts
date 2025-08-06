export interface Letter {
  character: string;
  name: string;
  pronunciation: string;
  id: number;
  audioUrl: string;
}

export interface CourseLinkProps {
  href: string;
  title: string;
  icon: string;
  disabled: boolean;
}

export interface FlashcardProps {
  letter: Letter;
  onNext: () => void;
  onLearned: () => void;
}

export interface PendingLearnedAction {
  characterId: number;
  index: number;
  element: HTMLElement | null;
}

export type FontType = 'sans' | 'serif'; 