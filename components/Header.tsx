import React from 'react';
import { Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="header-glass border-b border-slate-800/50 sticky top-0 z-10 animate-fade-in-down">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-200">{t('header.title')}</h1>
            <p className="text-sm text-slate-400">{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;