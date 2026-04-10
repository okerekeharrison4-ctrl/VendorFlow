import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Analyze the state of the art smart gesture guides and onboarding techniques for smart intuitive mobile apps in 2026 and 2027. What are the latest trends in contextual, spatial, and AI-driven gesture onboarding?",
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
