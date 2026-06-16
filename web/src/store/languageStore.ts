import { create } from 'zustand';
import type { Lang } from '../i18n/translations';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null) as Lang | null;

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: stored || 'en',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  toggleLang: () => {
    const next = get().lang === 'en' ? 'am' : 'en';
    localStorage.setItem('lang', next);
    set({ lang: next });
  },
}));
