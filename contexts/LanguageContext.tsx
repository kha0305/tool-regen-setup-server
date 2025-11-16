import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

type Language = 'en' | 'vi';
type Translations = { [key: string]: any };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [translations, setTranslations] = useState<{ en: Translations, vi: Translations } | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enRes, viRes] = await Promise.all([
          fetch('./locales/en.json'),
          fetch('./locales/vi.json')
        ]);
        if (!enRes.ok || !viRes.ok) {
            throw new Error('Network response was not ok');
        }
        const enJson = await enRes.json();
        const viJson = await viRes.json();
        setTranslations({ en: enJson, vi: viJson });
      } catch (error) {
        console.error("Failed to load translation files:", error);
      }
    };
    fetchTranslations();
  }, []);


  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    if (!translations) {
      return ''; // Return empty string or key while translations are loading
    }
    
    const langTranslations = translations[language];
    const keys = key.split('.');
    let text = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null, langTranslations);

    if (text === null) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            text = String(text).replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return String(text);
  }, [language, translations]);
  
  // Render nothing until the translations are loaded to prevent FOUC (Flash of Untranslated Content)
  if (!translations) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
