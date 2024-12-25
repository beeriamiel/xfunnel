import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Missing GEMINI_API_KEY");
  }
  
  console.log("\n=== Gemini Client Initialization ===");
  console.log("API Key:", `${apiKey.substring(0, 8)}...`);
  
  return new GoogleGenerativeAI(apiKey);
} 