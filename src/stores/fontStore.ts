import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FontType } from '@/types';

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