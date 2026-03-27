import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function searchSecurityPractices() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "What are the best state-of-the-art security practices for offline-first web applications using localStorage for sensitive data?",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text;
}
