import React, { createContext, useContext, useState } from 'react';
import { Language, translations } from './translations';

export type TranslationMap = typeof translations.en;

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationMap & ((key: keyof TranslationMap) => string);
}

const defaultT = new Proxy(((key: keyof TranslationMap) => translations.en[key] || key) as any, {
  get(_target, prop: string) {
    return (translations.en as any)[prop] || prop;
  },
});

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  currentLanguage: 'en',
  setLanguage: () => {},
  t: defaultT,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const translateFn = (key: keyof TranslationMap): string => {
    return (translations[language] as any)?.[key] || translations.en[key] || key;
  };

  const t = new Proxy(translateFn as any, {
    get(target, prop: string) {
      const currentDict = translations[language] as any;
      if (currentDict && prop in currentDict) {
        return currentDict[prop];
      }
      const fallbackDict = translations.en as any;
      if (fallbackDict && prop in fallbackDict) {
        return fallbackDict[prop];
      }
      return target[prop];
    },
  }) as TranslationMap & ((key: keyof TranslationMap) => string);

  return (
    <LanguageContext.Provider value={{ language, currentLanguage: language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
