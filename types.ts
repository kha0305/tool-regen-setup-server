
export interface JarVersion {
  version: string;
  url: string;
  type: string;
}

export interface ServerConfig {
  gameName: string;
  serverName: string;
  playerCount: number;
  serverPort: number;
  serverDescription: string;
  worldSeedOrMap: string;
  advancedOptions?: Record<string, string | number | boolean>;
  discordWebhookUrl?: string;
}

export interface GeneratedFile {
  fileName: string;
  fileContent: string;
}

export interface GeneratedConfig {
  files: GeneratedFile[];
  explanation: string;

  recommendedRamGB?: number;
  recommendedCpu?: string;
  recommendedSsdGB?: number;
}