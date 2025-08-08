import React, { createContext, useContext, useState, useEffect } from 'react';
import ko from '../locales/ko';
import en from '../locales/en';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [translations, setTranslations] = useState(ko);

  const languages = {
    ko: { name: '한국어', translations: ko },
    en: { name: 'English', translations: en }
  };

  useEffect(() => {
    // 로컬 스토리지에서 언어 설정 불러오기
    const savedLanguage = localStorage.getItem('language') || 'ko';
    setCurrentLanguage(savedLanguage);
    setTranslations(languages[savedLanguage].translations);
  }, []);

  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      setTranslations(languages[languageCode].translations);
      localStorage.setItem('language', languageCode);
    }
  };

  const t = (key) => {
    return translations[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
