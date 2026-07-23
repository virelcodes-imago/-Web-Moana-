import { createContext, useContext, useState, useEffect } from 'react';
import es from './es';
import pt from './pt';
import en from './en';

const TRANSLATIONS = { es, pt, en };
const STORAGE_KEY = 'moana_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'es';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['es']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
