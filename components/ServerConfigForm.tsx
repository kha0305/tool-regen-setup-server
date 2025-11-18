
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ServerConfig, JarVersion } from '../types';
import { Settings2, LoaderCircle, ChevronDown, Bell, Dices, Download, Check, AlertTriangle, Link2 } from 'lucide-react';
import { SUPPORTED_GAMES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';
import GameSpecificOptions from './GameSpecificOptions';

interface ServerConfigFormProps {
  onGenerate: (config: ServerConfig) => void;
  isLoading: boolean;
}

const useJarDownloader = () => {
    const { t } = useLanguage();
    const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success'>('idle');
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const downloadJar = useCallback((jar: JarVersion | null) => {
        if (!jar || downloadState === 'downloading') return;

        setDownloadState('downloading');
        setDownloadError(null);
        setLinkCopied(false);

        try {
            const newWindow = window.open(jar.url, '_blank', 'noopener,noreferrer');
            if (newWindow) {
                setDownloadState('success');
                setTimeout(() => setDownloadState('idle'), 3000);
            } else {
                console.error('Download window blocked, likely by a pop-up blocker.');
                setDownloadError(t('form.minecraft.downloadError'));
                setDownloadState('idle');
            }
        } catch (error) {
            console.error('Failed to initiate server JAR download:', error);
            setDownloadError(t('form.minecraft.downloadError'));
            setDownloadState('idle');
        }
    }, [downloadState, t]);

    const copyLink = useCallback((jar: JarVersion | null) => {
        if (!jar) return;
        navigator.clipboard.writeText(jar.url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    }, []);
    
    const resetDownloaderState = useCallback(() => {
        setDownloadState('idle');
        setDownloadError(null);
        setLinkCopied(false);
    }, []);

    return {
        downloadState,
        downloadError,
        linkCopied,
        downloadJar,
        copyLink,
        resetDownloaderState,
    };
};


const FALLBACK_JAR_VERSIONS: Record<string, JarVersion[]> = {
    paper: [
        { version: '1.21', url: 'https://api.papermc.io/v2/projects/paper/versions/1.21/builds/12/downloads/paper-1.21-12.jar', type: 'paper' },
        { version: '1.20.6', url: 'https://api.papermc.io/v2/projects/paper/versions/1.20.6/builds/142/downloads/paper-1.20.6-142.jar', type: 'paper' },
        { version: '1.16.5', url: 'https://api.papermc.io/v2/projects/paper/versions/1.16.5/builds/794/downloads/paper-1.16.5-794.jar', type: 'paper' },
        { version: '1.12.2', url: 'https://api.papermc.io/v2/projects/paper/versions/1.12.2/builds/1620/downloads/paper-1.12.2-1620.jar', type: 'paper' },
    ],
    spigot: [
        { version: '1.21', url: 'https://download.getbukkit.org/spigot/spigot-1.21.jar', type: 'spigot' },
        { version: '1.20.6', url: 'https://download.getbukkit.org/spigot/spigot-1.20.6.jar', type: 'spigot' },
        { version: '1.16.5', url: 'https://download.getbukkit.org/spigot/spigot-1.16.5.jar', type: 'spigot' },
        { version: '1.12.2', url: 'https://download.getbukkit.org/spigot/spigot-1.12.2.jar', type: 'spigot' },
        { version: '1.7.10', url: 'https://download.getbukkit.org/spigot/spigot-1.7.10-snapshot-b1657.jar', type: 'spigot' },
    ],
    purpur: [
        { version: '1.21', url: 'https://api.purpurmc.org/v2/purpur/1.21/2202/download', type: 'purpur' },
        { version: '1.20.6', url: 'https://api.purpurmc.org/v2/purpur/1.20.6/2189/download', type: 'purpur' },
        { version: '1.16.5', url: 'https://api.purpurmc.org/v2/purpur/1.16.5/1104/download', type: 'purpur' },
    ],
    vanilla: [
        { version: '1.21', url: 'https://piston-data.mojang.com/v1/objects/42851b14522441c42f77833503208a38b1abd910/server.jar', type: 'vanilla' },
        { version: '1.20.6', url: 'https://piston-data.mojang.com/v1/objects/1cf89c771477d13b435f795991879cca530cfca5/server.jar', type: 'vanilla' },
        { version: '1.16.5', url: 'https://piston-data.mojang.com/v1/objects/1b557e7b033b583cd9f66746b7a9ab1ec1673ced/server.jar', type: 'vanilla' },
        { version: '1.12.2', url: 'https://piston-data.mojang.com/v1/objects/886945bfb2b978778c3a0288fd7fab09d315b25f/server.jar', type: 'vanilla' },
        { version: '1.7.10', url: 'https://piston-data.mojang.com/v1/objects/e9e108d17e52d6651820f01a7c58010065960add/server.jar', type: 'vanilla' },
    ],
};


const ServerConfigForm: React.FC<ServerConfigFormProps> = ({ onGenerate, isLoading }) => {
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState(SUPPORTED_GAMES[0]); // Default to Minecraft
  const [customGameName, setCustomGameName] = useState('');
  const [serverName, setServerName] = useState('My Awesome Server');
  const [playerCount, setPlayerCount] = useState(10);
  const [serverPort, setServerPort] = useState(25565); // Default port for Minecraft
  const [serverDescription, setServerDescription] = useState('A chill PvE server with slightly boosted loot rates.');
  const [worldSeedOrMap, setWorldSeedOrMap] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState<Record<string, string | number | boolean>>({});
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isJarDropdownOpen, setIsJarDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [selectedJar, setSelectedJar] = useState<JarVersion | null>(null);
  const { 
    downloadState, 
    downloadError, 
    linkCopied, 
    downloadJar, 
    copyLink, 
    resetDownloaderState 
  } = useJarDownloader();

  const [jarVersions, setJarVersions] = useState<Record<string, JarVersion[]>>({});
  const [isFetchingJars, setIsFetchingJars] = useState(true);
  const [jarFetchError, setJarFetchError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const jarDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchJarVersions = async () => {
        if (selectedGame !== 'Minecraft') return;
        setIsFetchingJars(true);
        setJarFetchError(null);
        setSelectedJar(null);
        resetDownloaderState();
        try {
            const response = await fetch('https://mcutils.com/api/server-jars');
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            const data = await response.json();

            const versionLimit = 15;
            const processedVersions: Record<string, JarVersion[]> = {};
            
            const typesToFetch = ['vanilla', 'paper', 'spigot', 'purpur'];
            typesToFetch.forEach(type => {
                if (data[type] && data[type].length > 0) {
                    processedVersions[type] = data[type].slice(0, versionLimit).map((v: any) => ({ 
                        version: v.version, 
                        url: v.url, 
                        type: type 
                    }));
                }
            });

            // Merge with fallback/legacy versions to ensure they are always available
            const finalVersions: Record<string, JarVersion[]> = { ...processedVersions };
            Object.entries(FALLBACK_JAR_VERSIONS).forEach(([type, fallbackList]) => {
                if (!finalVersions[type]) {
                    finalVersions[type] = [];
                }
                const existingVersions = new Set(finalVersions[type].map(v => v.version));
                fallbackList.forEach(fallbackJar => {
                    if (!existingVersions.has(fallbackJar.version)) {
                        finalVersions[type].push(fallbackJar);
                        existingVersions.add(fallbackJar.version);
                    }
                });
            });

            setJarVersions(finalVersions);
        } catch (error) {
            console.error('Failed to fetch live jar versions, using fallback:', error);
            setJarVersions(FALLBACK_JAR_VERSIONS);
            setJarFetchError(t('form.minecraft.fetchFallback'));
        } finally {
            setIsFetchingJars(false);
        }
    };

    fetchJarVersions();
  }, [selectedGame, t, resetDownloaderState]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (jarDropdownRef.current && !jarDropdownRef.current.contains(event.target as Node)) {
        setIsJarDropdownOpen(false);
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

  const handleJarDownload = () => {
    downloadJar(selectedJar);
  };
  
  const handleCopyLink = () => {
    copyLink(selectedJar);
  };

  const handleVersionSelect = (jar: JarVersion) => {
    setSelectedJar(jar);
    resetDownloaderState();
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
      serverPort,
      serverDescription,
      worldSeedOrMap,
      advancedOptions,
      discordWebhookUrl: discordWebhookUrl.trim() === '' ? undefined : discordWebhookUrl.trim(),
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
       // Update default port based on game
      switch(game) {
          case 'Minecraft':
              setServerPort(25565);
              break;
          case 'Valheim':
              setServerPort(2456);
              break;
          case 'Terraria':
              setServerPort(7777);
              break;
          case 'Counter-Strike 2':
          case 'Left 4 Dead 2':
              setServerPort(27015);
              break;
          case 'ARK: Survival Evolved':
              setServerPort(7777);
              break;
          default:
              setServerPort(7777); // Generic default
      }
  };
  
  const handleRandomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    setWorldSeedOrMap(String(randomSeed));
  };

  const inputClasses = "input-glass w-full border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300";

  const JAR_TYPE_TITLES: Record<string, string> = {
    vanilla: t('form.minecraft.vanillaTitle'),
    paper: t('form.minecraft.paperTitle'),
    spigot: t('form.minecraft.spigotTitle'),
    purpur: t('form.minecraft.purpurTitle'),
  };

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
                {selectedGame === 'other' ? t('form.gameOtherOption') : selectedGame}
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full dropdown-glass rounded-md shadow-lg border border-slate-700 max-h-60 overflow-auto focus:outline-none no-scrollbar" role="listbox">
                    {SUPPORTED_GAMES.map(game => (
                        <button type="button" key={game} onClick={() => handleGameSelect(game)} className="group text-left w-full px-3 py-2 text-slate-300 hover:bg-slate-800/50 transition-all duration-200 hover:pl-4" role="option" aria-selected={selectedGame === game}>
                            {game}
                        </button>
                    ))}
                    <button type="button" key="other" onClick={() => handleGameSelect('other')} className="group text-left w-full px-3 py-2 text-slate-300 hover:bg-slate-800/50 transition-all duration-200 hover:pl-4" role="option" aria-selected={selectedGame === 'other'}>
                        {t('form.gameOtherOption')}
                    </button>
                </div>
            )}
          </div>
        </div>

        {selectedGame === 'Minecraft' && (
            <div className="animate-fade-in-up" ref={jarDropdownRef} style={{ animationDelay: '50ms' }}>
                <Tooltip text={t('form.minecraft.downloadJarTooltip')}>
                    <button
                        type="button"
                        onClick={() => setIsJarDropdownOpen(prev => !prev)}
                        className={`${inputClasses} flex items-center justify-between text-left text-sm py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/80`}
                    >
                        <div className="flex items-center">
                            <Download className="w-4 h-4 mr-2 text-slate-400" />
                            <span className="font-medium text-slate-300">{t('form.minecraft.downloadJarButton')}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isJarDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                </Tooltip>

                {isJarDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full dropdown-glass rounded-md shadow-lg border border-slate-700 flex flex-col max-h-96">
                        <div className="overflow-auto no-scrollbar p-1">
                            {isFetchingJars && (
                                <div className="flex items-center justify-center p-4 text-slate-400">
                                    <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
                                    {t('form.minecraft.fetchingJars')}
                                </div>
                            )}
                            {jarFetchError && (
                                <div className="flex items-center p-3 text-red-400 bg-red-900/20 rounded-md text-sm">
                                    <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
                                    <span className="break-words">{jarFetchError}</span>
                                </div>
                            )}
                            {!isFetchingJars && Object.keys(jarVersions).length > 0 &&
                            Object.entries(jarVersions).map(([type, versions]) => (
                                <div key={type}>
                                    <div className="p-2 text-xs font-semibold text-slate-400 border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-sm">{JAR_TYPE_TITLES[type] || type}</div>
                                    {versions.map(({ version, url }) => {
                                        const uniqueId = `${type}-${version}`;
                                        const typeName = (JAR_TYPE_TITLES[type] || type).split(' ')[0];
                                        const isSelected = selectedJar?.url === url;
                                        return (
                                            <button
                                                key={uniqueId}
                                                type="button"
                                                onClick={() => handleVersionSelect({ version, url, type })}
                                                className={`group text-left w-full px-3 py-2 text-slate-300 hover:bg-slate-800/50 transition-all duration-200 hover:pl-4 flex items-center justify-between
                                                    ${isSelected ? 'bg-slate-700/50' : ''}`}
                                            >
                                                <span className="text-sm">{typeName} {version}</span>
                                                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                            }
                        </div>

                         {!isFetchingJars && Object.keys(jarVersions).length > 0 && (
                            <div className="p-2 border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm shrink-0 space-y-2">
                                <button
                                type="button"
                                onClick={handleJarDownload}
                                disabled={!selectedJar || downloadState === 'downloading'}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors text-sm"
                                >
                                {downloadState === 'downloading' && (<><LoaderCircle className="animate-spin w-4 h-4 mr-2" />{t('form.minecraft.downloadingButton')}</>)}
                                {downloadState === 'success' && (<><Check className="w-4 h-4 mr-2" />{t('form.minecraft.downloadSuccessButton')}</>)}
                                {downloadState === 'idle' && (
                                    selectedJar 
                                    ? <><Download className="w-4 h-4 mr-2" />{t('form.minecraft.downloadSelectedButton')}</>
                                    : t('form.minecraft.selectVersionPrompt')
                                )}
                                </button>
                                {downloadError && (
                                    <div className="space-y-2">
                                        <div className="flex items-start p-2 text-red-400 bg-red-900/20 rounded-md text-xs">
                                            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                            <span className="break-words">{downloadError}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCopyLink}
                                            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-1.5 px-3 rounded-md flex items-center justify-center transition-colors text-xs"
                                        >
                                            {linkCopied ? (
                                                <><Check className="w-4 h-4 mr-2 text-green-400" />{t('form.minecraft.linkCopied')}</>
                                            ) : (
                                                <><Link2 className="w-4 h-4 mr-2" />{t('form.minecraft.copyLink')}</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        
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
            <label htmlFor="serverPort" className={labelClasses}>{t('form.serverPortLabel')}</label>
            <Tooltip text={t('form.serverPortTooltip')} />
          </div>
          <input 
            type="number" 
            id="serverPort" 
            min="1024"
            max="65535"
            value={serverPort} 
            onChange={e => setServerPort(parseInt(e.target.value, 10))} 
            className={inputClasses} 
            required 
          />
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
           <div className="relative">
            <input 
                type="text" 
                id="worldSeed" 
                value={worldSeedOrMap} 
                onChange={e => setWorldSeedOrMap(e.target.value)} 
                className={`${inputClasses} pr-12`} 
                placeholder={t('form.worldSeedPlaceholder')} 
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Tooltip text={t('form.randomizeSeedTooltip')}>
                    <button
                        type="button"
                        onClick={handleRandomizeSeed}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        aria-label={t('form.randomizeSeedTooltip')}
                    >
                        <Dices className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
          </div>
        </div>

        <GameSpecificOptions 
            game={selectedGame}
            options={advancedOptions}
            onChange={handleAdvancedOptionChange}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
        />

        <div className="border-t border-slate-700/50 pt-5 space-y-4">
            <button
                type="button"
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-panel"
            >
                <h3 className="font-semibold text-slate-300 flex items-center text-md">
                <Bell className="w-5 h-5 mr-3 text-slate-400" />
                {t('form.notifications.title')}
                </h3>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isNotificationsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div 
                id="notifications-panel"
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isNotificationsOpen ? 'max-h-48 pt-1' : 'max-h-0'}`}
            >
                <div>
                    <div className="flex items-center mb-2">
                    <label htmlFor="discordWebhookUrl" className={labelClasses}>{t('form.notifications.discordWebhookUrlLabel')}</label>
                    <Tooltip text={t('form.notifications.discordWebhookUrlTooltip')} />
                    </div>
                    <input 
                    type="url" 
                    id="discordWebhookUrl" 
                    value={discordWebhookUrl} 
                    onChange={e => setDiscordWebhookUrl(e.target.value)} 
                    className={inputClasses} 
                    placeholder={t('form.notifications.discordWebhookUrlPlaceholder')}
                    />
                </div>
            </div>
        </div>


        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 mt-2">
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