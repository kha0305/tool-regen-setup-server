
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Tooltip from './Tooltip';

interface GameSpecificOptionsProps {
  game: string;
  options: Record<string, any>;
  onChange: (key: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

const GameSpecificOptions: React.FC<GameSpecificOptionsProps> = ({ game, options, onChange, inputClasses, labelClasses }) => {
  const { t } = useLanguage();

  const renderMinecraftOptions = () => (
    <div className="animate-fade-in-up">
      <div className="flex items-center text-sm text-slate-400 mb-3 mt-1">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 font-semibold">{t('form.advancedOptionsTitle')}</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>
      <div className="space-y-5">
        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="minecraft_difficulty" className={labelClasses}>{t('form.minecraft.difficulty')}</label>
            <Tooltip text={t('form.minecraft.difficultyTooltip')} />
          </div>
          <select
            id="minecraft_difficulty"
            value={options.minecraft_difficulty || 'easy'}
            onChange={(e) => onChange('minecraft_difficulty', e.target.value)}
            className={inputClasses}
          >
            <option value="peaceful">{t('form.minecraft.options.peaceful')}</option>
            <option value="easy">{t('form.minecraft.options.easy')}</option>
            <option value="normal">{t('form.minecraft.options.normal')}</option>
            <option value="hard">{t('form.minecraft.options.hard')}</option>
          </select>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <label htmlFor="minecraft_gamemode" className={labelClasses}>{t('form.minecraft.gameMode')}</label>
            <Tooltip text={t('form.minecraft.gameModeTooltip')} />
          </div>
          <select
            id="minecraft_gamemode"
            value={options.minecraft_gamemode || 'survival'}
            onChange={(e) => onChange('minecraft_gamemode', e.target.value)}
            className={inputClasses}
          >
            <option value="survival">{t('form.minecraft.modes.survival')}</option>
            <option value="creative">{t('form.minecraft.modes.creative')}</option>
            <option value="adventure">{t('form.minecraft.modes.adventure')}</option>
          </select>
        </div>
        <div>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                    type="checkbox"
                    checked={options.minecraft_pvp ?? true}
                    onChange={(e) => onChange('minecraft_pvp', e.target.checked)}
                    className="h-4 w-4 accent-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 transition"
                />
                <span className={labelClasses}>{t('form.minecraft.enablePvp')}</span>
                <Tooltip text={t('form.minecraft.enablePvpTooltip')} />
            </label>
        </div>
        <div>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                    type="checkbox"
                    checked={options.minecraft_online_mode ?? true}
                    onChange={(e) => onChange('minecraft_online_mode', e.target.checked)}
                    className="h-4 w-4 accent-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 transition"
                />
                <span className={labelClasses}>{t('form.minecraft.onlineMode')}</span>
                <Tooltip text={t('form.minecraft.onlineModeTooltip')} />
            </label>
        </div>
        <div>
            <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                    type="checkbox"
                    checked={options.minecraft_enforce_whitelist ?? false}
                    onChange={(e) => onChange('minecraft_enforce_whitelist', e.target.checked)}
                    className="h-4 w-4 accent-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 transition"
                />
                <span className={labelClasses}>{t('form.minecraft.enforceWhitelist')}</span>
                <Tooltip text={t('form.minecraft.enforceWhitelistTooltip')} />
            </label>
        </div>
      </div>
    </div>
  );

  const renderValheimOptions = () => (
     <div className="animate-fade-in-up">
      <div className="flex items-center text-sm text-slate-400 mb-3 mt-1">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 font-semibold">{t('form.advancedOptionsTitle')}</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <label htmlFor="valheim_password" className={labelClasses}>{t('form.valheim.serverPassword')}</label>
          <Tooltip text={t('form.valheim.serverPasswordTooltip')} />
        </div>
        <input 
            type="text" 
            id="valheim_password" 
            value={options.valheim_password || ''}
            onChange={(e) => onChange('valheim_password', e.target.value)}
            className={inputClasses} 
            placeholder={t('form.valheim.serverPasswordPlaceholder')}
        />
      </div>
    </div>
  );

  const renderDiscordBotOptions = () => (
    <div className="animate-fade-in-up">
      <div className="flex items-center text-sm text-slate-400 mb-3 mt-1">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 font-semibold">{t('form.advancedOptionsTitle')}</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>
      <div>
        <div className="flex items-center mb-2">
          <label htmlFor="discord_client_id" className={labelClasses}>{t('form.discordBot.clientIdLabel')}</label>
          <Tooltip text={t('form.discordBot.clientIdTooltip')} />
        </div>
        <input 
            type="text" 
            id="discord_client_id" 
            value={options.discord_client_id || ''}
            onChange={(e) => onChange('discord_client_id', e.target.value)}
            className={inputClasses} 
            placeholder={t('form.discordBot.clientIdPlaceholder')}
        />
      </div>
    </div>
  );

  switch (game) {
    case 'Minecraft':
      return renderMinecraftOptions();
    case 'Valheim':
      return renderValheimOptions();
    case 'Discord Bot':
      return renderDiscordBotOptions();
    default:
      return null;
  }
};

export default GameSpecificOptions;