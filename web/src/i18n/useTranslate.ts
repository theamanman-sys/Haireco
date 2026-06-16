import { useLanguageStore } from '../store/languageStore';
import { t } from './translations';

export function useTranslate() {
  const lang = useLanguageStore((s) => s.lang);
  return (path: string): string => t(lang, path);
}
