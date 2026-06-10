import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TRANSLATIONS, LANGUAGES, type LangCode, type TranslationKey } from '../i18n/translations';

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
  langMeta: typeof LANGUAGES[number];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    try {
      return (localStorage.getItem('acs_lang') as LangCode) || 'en';
    } catch {
      return 'en';
    }
  });

  const langMeta = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const isRTL = langMeta.dir === 'rtl';

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    try { localStorage.setItem('acs_lang', newLang); } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    if (isRTL) {
      document.documentElement.classList.add('ac-rtl');
    } else {
      document.documentElement.classList.remove('ac-rtl');
    }
  }, [lang, isRTL]);

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL, langMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
