export const GAMEPLAY_CONFIG = {
  CARDS_PER_SESSION: 10,
  ANIMATION_DELAY: 250,
  CONFIRMATION_DELAY: 450,
  SUCCESS_POPUP_DURATION: 2000,
} as const;

export const STORAGE_KEYS = {
  LEARNED_LETTERS: 'learnedLetters',
  FONT_SETTINGS: 'font-settings',
} as const;

export const ROUTES = {
  HOME: '/',
  ALPHABET: '/learn/1',
  NUMBERS: '/learn/2',
  WORDS: '/learn/3',
} as const;

export const ALPHABET_TOTAL = 33; 