import React, { useState } from 'react';
import type { ServerConfig } from '../types';
import { SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { SUPPORTED_GAMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

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
  
  const handleGameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedGame(e.target.value);
      if (e.target.value !== 'other') {
          setCustomGameName(''); // Clear custom name if a preset is chosen
      }
  };

  const inputClasses = "w-full bg-slate-900/60 backdrop-blur-sm border border-slate-700/80 rounded-md px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl shadow-black/20">
      <h2 className="text-xl font-bold mb-6 text-cyan-400 flex items-center">
        <SlidersHorizontal className="w-6 h-6 mr-3" />
        {t('form.title')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="gameName" className={labelClasses}>{t('form.gameNameLabel')}</label>
          <select id="gameName" value={selectedGame} onChange={handleGameSelect} className={inputClasses} title={t('form.gameNameTooltip')}>
            {SUPPORTED_GAMES.map(game => (
                <option key={game} value={game}>{game}</option>
            ))}
            <option value="other">{t('form.gameOtherOption')}</option>
          </select>
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

        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
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