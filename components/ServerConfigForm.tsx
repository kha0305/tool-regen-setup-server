import React, { useState } from 'react';
import type { ServerConfig } from '../types';
import { SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { SUPPORTED_GAMES } from '../constants';

interface ServerConfigFormProps {
  onGenerate: (config: ServerConfig) => void;
  isLoading: boolean;
}

const ServerConfigForm: React.FC<ServerConfigFormProps> = ({ onGenerate, isLoading }) => {
  const [selectedGame, setSelectedGame] = useState(SUPPORTED_GAMES[1]); // Default to Valheim
  const [customGameName, setCustomGameName] = useState('');
  const [serverName, setServerName] = useState('My Awesome Server');
  const [playerCount, setPlayerCount] = useState(10);
  const [serverDescription, setServerDescription] = useState('A relaxed PvE server with slightly increased resource drop rates.');
  const [worldSeedOrMap, setWorldSeedOrMap] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameName = selectedGame === 'other' ? customGameName : selectedGame;

    if (!gameName) {
      // Basic validation in case the custom field is empty
      alert('Please select or enter a game name.');
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

  const inputClasses = "w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
        <SlidersHorizontal className="w-6 h-6 mr-2" />
        Server Configuration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameName" className={labelClasses}>Game Name</label>
          <select id="gameName" value={selectedGame} onChange={handleGameSelect} className={inputClasses} title="Select the game you want to create a server for. If your game isn't listed, choose 'Other'.">
            {SUPPORTED_GAMES.map(game => (
                <option key={game} value={game}>{game}</option>
            ))}
            <option value="other">Other (Please specify)</option>
          </select>
        </div>
        
        {selectedGame === 'other' && (
            <div className="animate-fade-in">
                 <label htmlFor="customGameName" className={`${labelClasses} text-cyan-400`}>Custom Game Name</label>
                 <input 
                    type="text" 
                    id="customGameName" 
                    value={customGameName} 
                    onChange={e => setCustomGameName(e.target.value)} 
                    className={inputClasses} 
                    placeholder="e.g., V Rising, 7 Days to Die" 
                    required 
                    autoFocus
                    title="Enter the name of the game if it's not in the dropdown list."
                 />
            </div>
        )}
        
        <div>
          <label htmlFor="serverName" className={labelClasses}>Server Name</label>
          <input type="text" id="serverName" value={serverName} onChange={e => setServerName(e.target.value)} className={inputClasses} required title="The name that will appear in the in-game server browser." />
        </div>

        <div>
          <label htmlFor="playerCount" className={labelClasses}>Max Players ({playerCount})</label>
          <input type="range" id="playerCount" min="2" max="200" step="1" value={playerCount} onChange={e => setPlayerCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" title="Set the maximum number of players that can join the server at one time." />
        </div>

        <div>
          <label htmlFor="serverDescription" className={labelClasses}>Server Description, Mods & Rules</label>
          <textarea id="serverDescription" value={serverDescription} onChange={e => setServerDescription(e.target.value)} className={`${inputClasses} h-24`} placeholder="e.g., PvE focused, 2x loot, list any mods..." title="Describe your server's purpose. Mention any special rules, mods, or settings (e.g., PvE, 2x loot)."></textarea>
        </div>

        <div>
          <label htmlFor="worldSeed" className={labelClasses}>World Seed / Map Name (Optional)</label>
          <input type="text" id="worldSeed" value={worldSeedOrMap} onChange={e => setWorldSeedOrMap(e.target.value)} className={inputClasses} placeholder="Leave empty for random/default" title="Enter a specific seed for world generation or a map name. Leave blank for a random/default world." />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105">
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin w-5 h-5 mr-2" />
              Generating...
            </>
          ) : (
            'Generate Server Files'
          )}
        </button>
      </form>
    </div>
  );
};

export default ServerConfigForm;