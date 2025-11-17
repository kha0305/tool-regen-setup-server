
import React, { useState, useRef, useEffect } from 'react';
import type { ServerConfig } from '../types';
import { Settings2, LoaderCircle, ChevronDown } from 'lucide-react';
import { SUPPORTED_GAMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

// --- SVG Icon Components ---
const iconProps = {
  className: "w-5 h-5 mr-3 inline-block shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors",
  'aria-hidden': true,
  focusable: false,
};
const selectedIconProps = {
    ...iconProps,
    className: "w-5 h-5 mr-3 inline-block shrink-0 text-slate-300",
}

const GameIcons: Record<string, React.FC<{selected?: boolean}>> = {
  'Minecraft': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2.5 16 4l-1.5 1.5L13 4l1.5-1.5Z"/><path d="m4 13 3 3 7.5-7.5-3-3-7.5 7.5Z"/><path d="m6.5 21.5 11.5-11.5-3-3-11.5 11.5 3 3Z"/></svg> ),
  'Valheim': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v6"/><path d="M12 16v6"/><path d="m15.5 4.5-4 4"/><path d="m8.5 4.5 4 4"/><path d="M4.5 8.5l4 4"/><path d="M4.5 15.5l4-4"/><path d="M19.5 8.5l-4 4"/><path d="M19.5 15.5l-4-4"/></svg> ),
  'Counter-Strike 2': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> ),
  'ARK: Survival Evolved': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 7 11l5 10 5-10L12 2z"/><path d="M7 11h10"/></svg> ),
  'Terraria': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7"/><path d="M10 15h4"/><path d="M12 15 7 9h10L12 15z"/><path d="M12 9 9 4h6L12 9z"/></svg> ),
  'Left 4 Dead 2': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 15V9a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v6"/><path d="M17 15V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v7"/><path d="M12 15V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v8"/><path d="M7 15V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6l3 4 3-4 3 4 3-4 3 4 3-4z"/></svg> ),
  'Palworld': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0-3.5 19.34"></path><path d="M12 22a10 10 0 0 1-3.5-19.34"></path></svg> ),
  'Factorio': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></svg> ),
  'Project Zomboid': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Z"></path><path d="M15 9.5a2.5 2.5 0 0 1 0 5"></path><path d="M9 9.5a2.5 2.5 0 0 0 0 5"></path><path d="M12 12a5 5 0 0 0-5 5"></path></svg> ),
  "Don't Starve Together": ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H18a2 2 0 0 1 2 2v3.5"></path><path d="M6 2H9.5"></path><path d="M2 6v3.5"></path><path d="M2 18v-3.5"></path><path d="M9.5 22H6a2 2 0 0 1-2-2v-3.5"></path><path d="M18 22h-3.5"></path><path d="M22 18v-3.5"></path><path d="M22 6V9.5"></path></svg> ),
};
const DefaultIcon: React.FC<{selected?: boolean}> = ({selected}) => (
    <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <path d="M12 12h.01"></path><path d="m9 12-1.5 2.5a2 2 0 0 0 0 2.5L9 19"></path><path d="m15 12 1.5 2.5a2 2 0 0 1 0 2.5L15 19"></path>
    </svg>
);


interface ServerConfigFormProps {
  onGenerate: (config: ServerConfig) => void;
  isLoading: boolean;
}

const ServerConfigForm: React.FC<ServerConfigFormProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState(SUPPORTED_GAMES[1]); // Default to Valheim
  const [customGameName, setCustomGameName] = useState('');
  const [serverName, setServerName] = useState('My Awesome Server');
  const [playerCount, setPlayerCount] = useState(10);
  const [serverDescription, setServerDescription] = useState('A chill PvE server with slightly boosted loot rates.');
  const [worldSeedOrMap, setWorldSeedOrMap] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameName = selectedGame === 'other' ? customGameName : selectedGame;

    if (!gameName) {
      alert(t('form.validationAlert'));
      return;
    }

    const config: ServerConfig = {
      gameName,
      serverName,
      playerCount,
      serverDescription,
      worldSeedOrMap,
    };
    onGenerate(config);
  };
  
  const handleGameSelect = (game: string) => {
      setSelectedGame(game);
      setIsDropdownOpen(false);
      if (game !== 'other') {
          setCustomGameName('');
      }
  };

  const inputClasses = "input-glass w-full border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";
  const SelectedIcon = GameIcons[selectedGame] || DefaultIcon;


  return (
    <div className="glass-container rounded-2xl p-6 shadow-2xl shadow-black/20">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 flex items-center">
        <Settings2 className="w-6 h-6 mr-3" />
        {t('form.title')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="gameName" className={labelClasses}>{t('form.gameNameLabel')}</label>
          <div className="relative" ref={dropdownRef}>
            <button type="button" id="gameName" onClick={() => setIsDropdownOpen(prev => !prev)} className={`${inputClasses} flex items-center justify-between text-left`} aria-haspopup="listbox" aria-expanded={isDropdownOpen}>
                <span className="flex items-center">
                    <SelectedIcon selected />
                    {selectedGame === 'other' ? t('form.gameOtherOption') : selectedGame}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full glass-container rounded-md shadow-lg border border-slate-700 max-h-60 overflow-auto focus:outline-none" role="listbox">
                    {SUPPORTED_GAMES.map(game => {
                        const Icon = GameIcons[game] || DefaultIcon;
                        return (
                            <button type="button" key={game} onClick={() => handleGameSelect(game)} className="group text-left w-full flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800/50 transition-colors" role="option" aria-selected={selectedGame === game}>
                                <Icon />
                                {game}
                            </button>
                        )
                    })}
                    <button type="button" key="other" onClick={() => handleGameSelect('other')} className="group text-left w-full flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800/50 transition-colors" role="option" aria-selected={selectedGame === 'other'}>
                        <DefaultIcon />
                        {t('form.gameOtherOption')}
                    </button>
                </div>
            )}
          </div>
        </div>
        
        {selectedGame === 'other' && (
            <div className="animate-fade-in-up">
                 <label htmlFor="customGameName" className={`${labelClasses} text-cyan-400`}>{t('form.customGameNameLabel')}</label>
                 <input 
                    type="text" 
                    id="customGameName" 
                    value={customGameName} 
                    onChange={e => setCustomGameName(e.target.value)} 
                    className={inputClasses} 
                    placeholder={t('form.customGameNamePlaceholder')}
                    required 
                    autoFocus
                    title={t('form.customGameNameTooltip')}
                 />
            </div>
        )}
        
        <div>
          <label htmlFor="serverName" className={labelClasses}>{t('form.serverNameLabel')}</label>
          <input type="text" id="serverName" value={serverName} onChange={e => setServerName(e.target.value)} className={inputClasses} required title={t('form.serverNameTooltip')} />
        </div>

        <div>
          <label htmlFor="playerCount" className={labelClasses}>{t('form.playerCountLabel', { count: playerCount })}</label>
          <input type="range" id="playerCount" min="2" max="200" step="1" value={playerCount} onChange={e => setPlayerCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" title={t('form.playerCountTooltip')} />
        </div>

        <div>
          <label htmlFor="serverDescription" className={labelClasses}>{t('form.descriptionLabel')}</label>
          <textarea id="serverDescription" value={serverDescription} onChange={e => setServerDescription(e.target.value)} className={`${inputClasses} h-24`} placeholder={t('form.descriptionPlaceholder')} title={t('form.descriptionTooltip')}></textarea>
        </div>

        <div>
          <label htmlFor="worldSeed" className={labelClasses}>{t('form.worldSeedLabel')}</label>
          <input type="text" id="worldSeed" value={worldSeedOrMap} onChange={e => setWorldSeedOrMap(e.target.value)} className={inputClasses} placeholder={t('form.worldSeedPlaceholder')} title={t('form.worldSeedTooltip')} />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40">
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5 mr-2" />
              {t('form.submitButtonLoading')}
            </>
          ) : (
            t('form.submitButton')
          )}
        </button>
      </form>
    </div>
  );
};

export default ServerConfigForm;
