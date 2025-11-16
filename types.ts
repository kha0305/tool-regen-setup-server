
export interface ServerConfig {
  gameName: string;
  serverName: string;
  playerCount: number;
  serverDescription: string;
  worldSeedOrMap: string;
}

export interface GeneratedFile {
  fileName: string;
  fileContent: string;
}

export interface GeneratedConfig {
  files: GeneratedFile[];
  explanation: string;
  recommendedRamGB?: number;
}