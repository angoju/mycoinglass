import { GoogleGenAI, Type } from "@google/genai";
import { CoinData, MarketSentiment, AIAnalysisResult } from '../types';

// Initialize the API client
// Note: API key is assumed to be in process.env.API_KEY
const apiKey = process.env.API_KEY || 'dummy-key'; 
// In a real scenario, we handle the missing key gracefully in the UI.

const ai = new GoogleGenAI({ apiKey });

export const analyzeMarket = async (coins: CoinData[], sentiment: MarketSentiment): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    // Fallback if no key is provided in environment
    return {
      summary: "API Key missing. Please provide a valid Gemini API Key to unlock AI insights. Displaying simulation mode analysis.",
      keyRisks: ["Unknown Volatility", "Data Gaps"],
      outlook: "Neutral"
    };
  }

  try {
    // Prepare a lightweight summary of the data to avoid token limits
    const topMovers = coins
      .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
      .slice(0, 5)
      .map(c => `${c.symbol}: ${c.priceChange24h.toFixed(2)}%`);

    const highFunding = coins
      .filter(c => Math.abs(c.fundingRate) > 0.03)
      .map(c => `${c.symbol} (${c.fundingRate.toFixed(3)}%)`);

    const context = `
      Market Context:
      Fear & Greed: ${sentiment.fearGreedIndex}
      BTC Dominance: ${sentiment.btcDominance.toFixed(1)}%
      
      Top Movers (24h):
      ${topMovers.join(', ')}

      Unusual Funding Rates:
      ${highFunding.join(', ')}
    `;

    const prompt = `
      You are a senior crypto market analyst. Analyze the provided market summary.
      
      ${context}

      Provide:
      1. A concise 2-sentence market summary.
      2. A list of 3 key risks or opportunities.
      3. An overall outlook (Bullish, Bearish, or Neutral).
      
      Return as JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyRisks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            outlook: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "AI Analysis currently unavailable. Market shows mixed signals based on technical indicators.",
      keyRisks: ["High Volatility", "Liquidation Cascades"],
      outlook: "Neutral"
    };
  }
};