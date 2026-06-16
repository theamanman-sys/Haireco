import en, { type Translations } from './en';
import am from './am';

const translations: Record<string, Translations> = { en, am };

export type Lang = keyof typeof translations;
export const languages: Lang[] = ['en', 'am'];

export function t(lang: Lang, path: string): string {
  const keys = path.split('.');
  let value: any = translations[lang];
  for (const key of keys) {
    value = value?.[key];
  }
  return typeof value === 'string' ? value : path;
}

export default translations;
