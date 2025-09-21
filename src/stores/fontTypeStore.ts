import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FontType } from '@/types';

interface FontTypeState {
  fontType: FontType;
  setFontType: (fontType: FontType) => void;
}

export const useFontTypeStore = create<FontTypeState>()(
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