
import { GoogleGenAI, Type } from "@google/genai";
import { CombinedChannel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (
  query: string,
  availableCategories: string[],
  availableCountries: string[]
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is looking for IPTV channels. Query: "${query}". 
      Available Categories: ${availableCategories.join(", ")}.
      Available Countries (codes): ${availableCountries.join(", ")}.
      
      Recommend appropriate filters.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: { type: Type.STRING, description: "Category ID to filter by" },
            suggestedCountry: { type: Type.STRING, description: "Country code to filter by" },
            reasoning: { type: Type.STRING, description: "Short explanation for recommendation" },
            searchKeywords: { type: Type.STRING, description: "Specific terms to look for in channel names" }
          },
          required: ["reasoning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return null;
  }
};

export const chatWithAssistant = async (message: string, context: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an IPTV expert helping users find television channels. 
      You have access to a large database of global channels. 
      Current user view context: ${context}.
      Be concise, helpful, and suggest specific countries or categories if appropriate.`,
    },
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};
