import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

// 국기 이모지 매핑
const flagEmojis = {
  ko: '🇰🇷',
  en: '🇺🇸',
  de: '🇩🇪'
};

const LanguageToggle = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-toggle">
      <button 
        className="language-toggle-button"
        onClick={toggleDropdown}
        title="언어 변경 / Change Language"
      >
        <span className="current-language">
          {flagEmojis[currentLanguage]} {languages[currentLanguage].name}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {Object.entries(languages).map(([code, { name }]) => (
            <button
              key={code}
              className={`language-option ${currentLanguage === code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(code)}
            >
              <span className="flag-emoji">{flagEmojis[code]}</span>
              <span className="language-name">{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
