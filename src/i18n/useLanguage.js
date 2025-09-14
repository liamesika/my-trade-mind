import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'he';
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'he' : 'en';
    changeLanguage(newLang);
  };
  
  return {
    t,
    currentLanguage,
    isRTL,
    changeLanguage,
    toggleLanguage
  };
};