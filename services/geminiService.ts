
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini with the required named parameter and environment-sourced API Key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured trip plan using Gemini 3 Pro for advanced reasoning.
 */
export const generateTripPlan = async (destination: string, duration: string, budget: string, interests: string[]) => {
  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex reasoning and planning tasks.
      model: "gemini-3-pro-preview",
      contents: `Plan a ${duration} trip to ${destination} with a ${budget} budget focusing on ${interests.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            duration: { type: Type.STRING },
            budget: { type: Type.STRING },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  activity: { type: Type.STRING },
                  details: { type: Type.STRING }
                },
                required: ["day", "activity", "details"]
              }
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["destination", "duration", "budget", "interests", "itinerary", "recommendations"]
        }
      }
    });

    // Correctly extracting the text from the GenerateContentResponse object.
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Received empty response from the AI Concierge.");
    }
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
