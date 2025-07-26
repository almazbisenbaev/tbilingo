import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontType = 'sans' | 'serif';

interface FontState {
  fontType: FontType;
  setFontType: (fontType: FontType) => void;
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      fontType: 'sans',
      setFontType: (fontType: FontType) => set({ fontType }),
    }),
    {
      name: 'font-settings',
    }
  )
); 