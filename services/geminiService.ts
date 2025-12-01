import { GoogleGenAI, Type } from "@google/genai";
import { CoinData, MarketSentiment, AIAnalysisResult } from '../types';

// Initialize the API client
// Note: API key is assumed to be in process.env.API_KEY
const apiKey = process.env.API_KEY || 'dummy-key'; 

const ai = new GoogleGenAI({ apiKey });

export const analyzeMarket = async (coins: CoinData[], sentiment: MarketSentiment): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    // Fallback if no key is provided in environment
    return {
      summary: "API Key missing. Please provide a valid Gemini API Key to unlock AI insights. Displaying simulation mode analysis.",
      keyRisks: ["Unknown Volatility", "Data Gaps"],
      outlook: "Neutral",
      topTradeSetups: []
    };
  }

  try {
    // Prepare a lightweight summary of the data to avoid token limits
    const topMovers = coins
      .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
      .slice(0, 8)
      .map(c => `${c.symbol}: $${c.price.toFixed(2)} (24h: ${c.priceChange24h.toFixed(2)}%, Funding: ${c.fundingRate.toFixed(4)}%)`);

    const context = `
      Market Context:
      Fear & Greed: ${sentiment.fearGreedIndex}
      BTC Dominance: ${sentiment.btcDominance.toFixed(1)}%
      
      Top Assets Data:
      ${topMovers.join('\n')}
    `;

    const prompt = `
      You are an expert crypto trader using Smart Money Concepts. Analyze the provided market data.
      
      ${context}

      1. Provide a concise market summary.
      2. Identify 3 key risks.
      3. Give an overall outlook.
      4. Suggest 2 high-probability trade setups (1 Long, 1 Short if possible) based on the momentum and funding rates provided. Include Entry, Target, and Stop Loss.

      Return strictly as JSON.
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
            outlook: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
            topTradeSetups: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  coin: { type: Type.STRING },
                  direction: { type: Type.STRING, enum: ["LONG", "SHORT"] },
                  entry: { type: Type.STRING },
                  target: { type: Type.STRING },
                  stopLoss: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                }
              }
            }
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
      outlook: "Neutral",
      topTradeSetups: []
    };
  }
};