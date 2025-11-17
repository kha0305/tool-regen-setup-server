
import React, { useState, useRef, useEffect } from 'react';
import type { ServerConfig } from '../types';
import { Settings2, LoaderCircle, ChevronDown } from 'lucide-react';
import { SUPPORTED_GAMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';
import GameSpecificOptions from './GameSpecificOptions';

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
  'Minecraft': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"/><path d="M3 11h18"/></svg> ),
  'Valheim': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v6"/><path d="M12 16v6"/><path d="m15.5 4.5-4 4"/><path d="m8.5 4.5 4 4"/><path d="M4.5 8.5l4 4"/><path d="M4.5 15.5l4-4"/><path d="M19.5 8.5l-4 4"/><path d="M19.5 15.5l-4-4"/></svg> ),
  'Counter-Strike 2': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M22 12h-4M6 12H2"/><path d="M15 9.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M12 12v3"/></svg> ),
  'ARK: Survival Evolved': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 20l9-4 9 4-9-18Z"/><path d="M12 11v5"/><path d="m8.5 14.5 3.5-2.5 3.5 2.5"/><path d="m7 12 5-3 5 3"/></svg> ),
  'Terraria': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V11" /><path d="M12 11 8 13" /><path d="M12 11 16 13" /><circle cx="12" cy="7" r="4" /><circle cx="7" cy="15" r="3" /><circle cx="17" cy="15" r="3" /></svg> ),
  'Left 4 Dead 2': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.7 17.3c0-1.7.9-3.3 2.3-3.3s2.3 1.6 2.3 3.3"/><path d="M15.9 14.3c0-1.7 1.2-3.3 2.8-3.3 1.6 0 2.8 1.6 2.8 3.3"/><path d="M13.4 11.3c0-1.7 1-3.3 2.5-3.3s2.5 1.6 2.5 3.3"/><path d="M8.2 11.3c0-1.7 1.2-3.3 2.8-3.3 1.6 0 2.8 1.6 2.8 3.3"/><path d="M3.5 14.3c0-1.7 1.2-3.3 2.8-3.3 1.6 0 2.8 1.6 2.8 3.3"/><path d="M2.5 22.3V15c0-4.4 3.6-8 8-8h0c1.9 0 3.8.7 5.2 2"/></svg> ),
  'Palworld': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0-3.5 19.34"></path><path d="M12 22a10 10 0 0 1-3.5-19.34"></path></svg> ),
  'Factorio': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></svg> ),
  'Project Zomboid': ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10c0-2.2-.7-4.2-1.9-5.8M17 3l-4.2 4.2c-.2.2-.3.5-.3.8v3c0 .6.4 1 1 1h3c.3 0 .6-.1.8-.3L21 9"/></svg> ),
  "Don't Starve Together": ({selected}) => ( <svg {...(selected ? selectedIconProps : iconProps)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 5.5L3 12l7.5 6.5"/><path d="M13.5 5.5L21 12l-7.5 6.5"/><path d="M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg> ),
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
  const [advancedOptions, setAdvancedOptions] = useState<Record<string, string | number | boolean>>({});
  
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
  
  const handleAdvancedOptionChange = (key: string, value: string | number | boolean) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

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
      advancedOptions
    };
    onGenerate(config);
  };
  
  const handleGameSelect = (game: string) => {
      setSelectedGame(game);
      setIsDropdownOpen(false);
      setAdvancedOptions({}); // Reset advanced options on game change
      if (game !== 'other') {
          setCustomGameName('');
      }
  };

  const inputClasses = "input-glass w-full border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300";
  const SelectedIcon = GameIcons[selectedGame] || DefaultIcon;


  return (
    <div className="glass-container rounded-2xl p-6 shadow-2xl shadow-black/20">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 flex items-center">
        <Settings2 className="w-6 h-6 mr-3" />
        {t('form.title')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="gameName" className={labelClasses}>{t('form.gameNameLabel')}</label>
            <Tooltip text={t('form.gameNameTooltip')} />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button type="button" id="gameName" onClick={() => setIsDropdownOpen(prev => !prev)} className={`${inputClasses} flex items-center justify-between text-left`} aria-haspopup="listbox" aria-expanded={isDropdownOpen}>
                <span className="flex items-center">
                    <SelectedIcon selected />
                    {selectedGame === 'other' ? t('form.gameOtherOption') : selectedGame}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full glass-container rounded-md shadow-lg border border-slate-700 max-h-60 overflow-auto focus:outline-none no-scrollbar" role="listbox">
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
                 <div className="flex items-center mb-2">
                    <label htmlFor="customGameName" className={`${labelClasses} text-cyan-400`}>{t('form.customGameNameLabel')}</label>
                    <Tooltip text={t('form.customGameNameTooltip')} />
                 </div>
                 <input 
                    type="text" 
                    id="customGameName" 
                    value={customGameName} 
                    onChange={e => setCustomGameName(e.target.value)} 
                    className={inputClasses} 
                    placeholder={t('form.customGameNamePlaceholder')}
                    required 
                    autoFocus
                 />
            </div>
        )}
        
        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="serverName" className={labelClasses}>{t('form.serverNameLabel')}</label>
            <Tooltip text={t('form.serverNameTooltip')} />
          </div>
          <input type="text" id="serverName" value={serverName} onChange={e => setServerName(e.target.value)} className={inputClasses} required />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="playerCount" className={labelClasses}>{t('form.playerCountLabel', { count: playerCount })}</label>
            <Tooltip text={t('form.playerCountTooltip')} />
          </div>
          <input type="range" id="playerCount" min="2" max="200" step="1" value={playerCount} onChange={e => setPlayerCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
           <div className="flex items-center mb-2">
            <label htmlFor="serverDescription" className={labelClasses}>{t('form.descriptionLabel')}</label>
            <Tooltip text={t('form.descriptionTooltip')} />
          </div>
          <textarea id="serverDescription" value={serverDescription} onChange={e => setServerDescription(e.target.value)} className={`${inputClasses} h-24`} placeholder={t('form.descriptionPlaceholder')}></textarea>
        </div>

        <div>
           <div className="flex items-center mb-2">
            <label htmlFor="worldSeed" className={labelClasses}>{t('form.worldSeedLabel')}</label>
            <Tooltip text={t('form.worldSeedTooltip')} />
          </div>
          <input type="text" id="worldSeed" value={worldSeedOrMap} onChange={e => setWorldSeedOrMap(e.target.value)} className={inputClasses} placeholder={t('form.worldSeedPlaceholder')} />
        </div>

        <GameSpecificOptions 
            game={selectedGame}
            options={advancedOptions}
            onChange={handleAdvancedOptionChange}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
        />

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