import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
      aria-label={`Switch language to ${language === 'en' ? 'Vietnamese' : 'English'}`}
      title={`Switch language to ${language === 'en' ? 'Vietnamese' : 'English'}`}
    >
      <Languages className="w-4 h-4 mr-2" />
      {language.toUpperCase()}
    </button>
  );
};

export default LanguageSwitcher;