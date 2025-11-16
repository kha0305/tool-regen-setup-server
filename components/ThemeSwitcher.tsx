import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Sparkles } from 'lucide-react';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'dark', icon: Moon },
    { name: 'light', icon: Sun },
    { name: 'rainbow', icon: Sparkles },
  ] as const;

  const baseClasses = "flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const activeClasses = "bg-slate-700 text-white";
  const inactiveClasses = "text-slate-400 hover:text-white hover:bg-slate-800";


  return (
    <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
      {themes.map((themeOption) => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name)}
          className={`${baseClasses} ${theme === themeOption.name ? activeClasses : inactiveClasses}`}
          aria-label={`Switch to ${themeOption.name} theme`}
          title={`Switch to ${themeOption.name} theme`}
        >
          <themeOption.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;