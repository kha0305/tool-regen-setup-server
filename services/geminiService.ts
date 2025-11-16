
// FIX: Use named imports for GoogleGenAI and Type as per the guidelines.
import { GoogleGenAI, Type } from '@google/genai';
import type { ServerConfig, GeneratedConfig } from '../types';

export const generateServerConfig = async (config: ServerConfig, lang: 'vi' | 'en'): Promise<GeneratedConfig> => {
  // The execution environment is expected to provide process.env.API_KEY.
  // We initialize the client directly as per the guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const explanationLanguage = lang === 'vi' ? 'Vietnamese' : 'English';

  const prompt = `
    You are an expert game server administrator with knowledge of configuration files and hardware requirements for a wide variety of PC games.

    Based on the user's request, generate all necessary configuration files, a startup script, and estimate the required RAM.

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
    4.  Provide a brief, user-friendly explanation of the generated files and any next steps the user should take. This explanation MUST be in ${explanationLanguage}.
    5.  Estimate the recommended RAM in gigabytes (GB) for this server configuration. Consider the game, player count, and any mentioned mods. Return this as a single number.

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
          // FIX: Use the Type enum for schema properties as per the guidelines.
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: `A brief, user-friendly explanation of the generated files and instructions for the user, in ${explanationLanguage}.`,
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
            },
            recommendedRamGB: {
              type: Type.NUMBER,
              description: "Estimated recommended RAM in gigabytes (GB) for the server. Example: 8"
            }
          },
          required: ["explanation", "files", "recommendedRamGB"],
        },
      },
    });

    rawResponseText = response.text;
    
    // When using responseSchema, the model returns a clean JSON string.
    if (!rawResponseText) {
        throw new Error("The AI returned an empty response.");
    }
    
    const resultJson = JSON.parse(rawResponseText);
    
    // The schema is enforced by the model, but a simple check ensures robustness.
    if (!resultJson.files || !resultJson.explanation) {
        throw new Error("AI response is missing required fields (files or explanation).");
    }

    return resultJson as GeneratedConfig;

  } catch (error) {
    console.error("Error calling or processing Gemini API response:", error);
    // Log the raw text for better debugging.
    if (rawResponseText) {
        console.error("Raw response text that caused the error:", rawResponseText);
    }

    let errorMessage = "The AI failed to generate a valid configuration. Please check your inputs or try again.";
    if (error instanceof SyntaxError) {
      errorMessage = "The AI returned a response in an invalid format. Please try again.";
    } else if (error instanceof Error) {
        errorMessage = `Failed to generate configuration: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};