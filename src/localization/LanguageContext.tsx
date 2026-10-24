import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations } from './translations';

export type TranslationMap = typeof translations.en;

const STORAGE_KEY = 'dg_user_language';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationMap & ((key: keyof TranslationMap) => string);
}

const defaultDict = translations.en;
const defaultFn = (key: keyof TranslationMap): string => {
  return defaultDict[key] || (key as string);
};
Object.assign(defaultFn, defaultDict);
const defaultT = defaultFn as TranslationMap & ((key: keyof TranslationMap) => string);

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  currentLanguage: 'en',
  setLanguage: () => {},
  t: defaultT,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language preference on startup
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isMounted && saved && (saved === 'en' || saved === 'rw')) {
          setLanguageState(saved as Language);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    AsyncStorage.setItem(STORAGE_KEY, newLang).catch(() => {});
  }, []);

  // Build reactive translation helper that supports both t.key and t('key')
  // Using direct Object.assign instead of Proxy for 100% Hermes engine compatibility
  const t = useMemo(() => {
    const activeDict = translations[language] || translations.en;
    const translate = (key: keyof TranslationMap): string => {
      return activeDict[key] || translations.en[key] || (key as string);
    };
    Object.assign(translate, activeDict);
    return translate as TranslationMap & ((key: keyof TranslationMap) => string);
  }, [language]);

  const contextValue = useMemo(
    () => ({
      language,
      currentLanguage: language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
