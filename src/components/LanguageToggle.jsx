import React from 'react';
import { useLanguage } from '../i18n/useLanguage';
import '../styles/language-toggle.css';

const LanguageToggle = ({ variant = 'default' }) => {
  const { currentLanguage, toggleLanguage, t } = useLanguage();
  
  const buttonText = currentLanguage === 'en' ? 'עברית' : 'English';
  
  return (
    <button 
      className={`language-toggle ${variant}`}
      onClick={toggleLanguage}
      aria-label={t('common.changeLanguage')}
      type="button"
    >
      {buttonText}
    </button>
  );
};

export default LanguageToggle;