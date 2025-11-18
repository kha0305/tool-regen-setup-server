
import type { ServerConfig, GeneratedConfig } from '../types';
import { MOCK_GAME_DATA } from './mockData';

/**
 * Generates a generic, dynamic configuration for unsupported games.
 */
const generateGenericMockConfig = (config: ServerConfig, lang: 'vi' | 'en'): GeneratedConfig => {
  const explanation = lang === 'vi' 
    ? `Đây là cấu hình máy chủ giả lập cho game "${config.gameName}".\n\n- Tên máy chủ: ${config.serverName}\n- Số người chơi: ${config.playerCount}\n\nCác tệp đã được tạo dựa trên yêu cầu của bạn. Để bắt đầu, hãy tải các tệp xuống, đặt chúng vào thư mục gốc của máy chủ và chạy tệp 'start.sh' từ terminal của bạn.\n\nLưu ý: Đây là dữ liệu giả và không sử dụng API key.`
    : `This is a mock server configuration for the game "${config.gameName}".\n\n- Server Name: ${config.serverName}\n- Player Count: ${config.playerCount}\n\nThe files have been generated based on your request. To get started, download the files, place them in your server's root directory, and execute the 'start.sh' script from your terminal.\n\nNote: This is mock data and does not use an API key.`;

  const mockConfigFileContent = `
# Mock configuration for ${config.gameName}
# Generated for server: "${config.serverName}"

server_name = "${config.serverName}"
max_players = ${config.playerCount}
port = ${config.serverPort}
world_seed = "${config.worldSeedOrMap || 'random-mock-seed'}"
description = "${config.serverDescription}"

# --- Additional mock settings ---
enable_pve = true
difficulty = "normal"
auto_save_interval_minutes = 15
`.trim();

  const mockStartScriptContent = `#!/bin/bash
# Mock startup script for ${config.gameName}

echo "==============================================="
echo "  STARTING MOCK SERVER: ${config.serverName}"
echo "==============================================="
echo "Game: ${config.gameName}"
echo "Max Players: ${config.playerCount}"
echo "Port: ${config.serverPort}"
echo ""
echo "NOTE: This is a mock script. In a real environment,"
echo "you would execute the game's dedicated server binary here,"
echo "e.g., './${config.gameName.toLowerCase().replace(/\s/g, '_')}_server -config server.cfg -port ${config.serverPort}'"
echo ""
echo "Server is now 'running'. Press Ctrl+C to stop."

# This command keeps the script running to simulate a server process
tail -f /dev/null
`.trim();

  return {
    explanation: explanation,
    files: [
      {
        fileName: `server-settings.cfg`,
        fileContent: mockConfigFileContent,
      },
      {
        fileName: "start.sh",
        fileContent: mockStartScriptContent,
      }
    ],
    recommendedRamGB: Math.max(4, Math.round(config.playerCount / 8 + 2)), 
    recommendedCpu: "4+ Cores @ 3.0GHz+",
    recommendedSsdGB: Math.max(20, 10 + Math.round(config.playerCount / 2)),
  };
};

/**
 * Looks up pre-defined mock data for a given game and replaces placeholders with user config.
 * Falls back to a generic generator if the game is not found.
 */
export const generateServerConfig = async (config: ServerConfig, lang: 'vi' | 'en'): Promise<GeneratedConfig> => {
  const gameKey = config.gameName.toLowerCase();
  const gameTemplate = MOCK_GAME_DATA[gameKey];

  // If no specific template exists, use the generic fallback
  if (!gameTemplate) {
    return generateGenericMockConfig(config, lang);
  }

  // A template exists, so process it.
  const recommendedRam = Math.max(gameTemplate.recommendedRamGB, Math.round(config.playerCount / 10 + 2));
  const recommendedSsd = Math.max(gameTemplate.recommendedSsdGB, 10 + config.playerCount);

  // Define all possible placeholders and their replacement values
  const replacements: Record<string, string> = {
    '{{gameName}}': config.gameName,
    '{{serverName}}': config.serverName,
    '{{playerCount}}': String(config.playerCount),
    '{{serverPort}}': String(config.serverPort),
    '{{worldSeedOrMap}}': config.worldSeedOrMap || gameTemplate.defaultWorldName,
    '{{serverDescription}}': config.serverDescription,
    '{{recommendedRamGB}}': String(recommendedRam),
    
    // Advanced options with defaults
    // Minecraft
    '{{minecraft_difficulty}}': String(config.advancedOptions?.minecraft_difficulty || 'easy'),
    '{{minecraft_gamemode}}': String(config.advancedOptions?.minecraft_gamemode || 'survival'),
    '{{minecraft_pvp}}': String(config.advancedOptions?.minecraft_pvp ?? true),
    '{{minecraft_online_mode}}': String(config.advancedOptions?.minecraft_online_mode ?? true),
    '{{minecraft_enforce_whitelist}}': String(config.advancedOptions?.minecraft_enforce_whitelist ?? false),

    // Valheim
    '{{valheim_password}}': String(config.advancedOptions?.valheim_password || 'secret'),
  };

  // Helper function to replace all placeholders in a string
  const processTemplate = (templateString: string): string => {
    let result = templateString;
    for (const placeholder in replacements) {
      result = result.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
    }
    return result;
  };
  
  // Build the final configuration from the template
  const finalConfig: GeneratedConfig = {
    explanation: processTemplate(gameTemplate.explanation[lang]),
    files: gameTemplate.files.map(file => ({
      fileName: processTemplate(file.fileName),
      fileContent: processTemplate(file.fileContent).trim(),
    })),
    recommendedRamGB: recommendedRam,
    recommendedCpu: gameTemplate.recommendedCpu,
    recommendedSsdGB: recommendedSsd,
  };

  return finalConfig;
};