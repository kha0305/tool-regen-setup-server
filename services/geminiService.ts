import { GoogleGenAI, Type } from '@google/genai';
import type { ServerConfig, GeneratedConfig } from '../types';

export const generateServerConfig = async (config: ServerConfig): Promise<GeneratedConfig> => {
  // The execution environment is expected to provide process.env.API_KEY.
  // We initialize the client directly as per the guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert game server administrator with knowledge of configuration files for a wide variety of PC games.

    Based on the user's request, generate all necessary configuration files and a startup script.

    User's Request:
    - Game: ${config.gameName}
    - Server Name: ${config.serverName}
    - Max Players: ${config.playerCount}
    - World Seed / Map Name: ${config.worldSeedOrMap || 'default'}
    - Description of desired server behavior (mods, rules, etc.): ${config.serverDescription || 'Standard configuration'}

    Your Tasks:
    1.  Identify the correct file names and formats for the specified game (e.g., server.cfg, Game.ini, server-settings.json).
    2.  Generate the content for these files based on the user's request.
    3.  Create a simple shell startup script (start.sh) for Linux. Assume the server executable is in the same directory. The script should allocate a reasonable amount of resources for the game and player count and include a restart loop if applicable.
    4.  Provide a brief, user-friendly explanation of the generated files and any next steps the user should take (e.g., "Place these files in your server's root directory and run 'chmod +x start.sh' before executing it.").

    Return the output in the specified JSON format.
    `;

  let rawResponseText = '';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A brief, user-friendly explanation of the generated files and instructions for the user.",
            },
            files: {
              type: Type.ARRAY,
              description: "An array of generated file objects.",
              items: {
                type: Type.OBJECT,
                properties: {
                  fileName: {
                    type: Type.STRING,
                    description: "The name of the file, e.g., 'server.cfg' or 'start.sh'.",
                  },
                  fileContent: {
                    type: Type.STRING,
                    description: "The full text content of the file.",
                  }
                },
                required: ["fileName", "fileContent"]
              }
            }
          },
          required: ["explanation", "files"],
        },
      },
    });

    rawResponseText = response.text;
    
    // The model might wrap the JSON in markdown backticks. Clean it before parsing.
    const cleanedJsonString = rawResponseText.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

    if (!cleanedJsonString) {
        throw new Error("The AI returned an empty response.");
    }
    
    const resultJson = JSON.parse(cleanedJsonString);
    
    if (!resultJson.files || !resultJson.explanation) {
        throw new Error("AI response is missing required fields (files or explanation).");
    }

    return resultJson as GeneratedConfig;

  } catch (error) {
    console.error