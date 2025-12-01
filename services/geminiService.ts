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
    // Prepare a richer summary of the data (Top 15 coins)
    const topMovers = coins
      .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
      .slice(0, 15)
      .map(c => `${c.symbol}: $${c.price.toFixed(2)} (24h: ${c.priceChange24h.toFixed(2)}%, Funding: ${c.fundingRate.toFixed(4)}%, OI 1h: ${c.openInterestChange1h.toFixed(2)}%)`);

    const context = `
      Market Context:
      Fear & Greed: ${sentiment.fearGreedIndex}
      BTC Dominance: ${sentiment.btcDominance.toFixed(1)}%
      
      Top Volatility Assets Data:
      ${topMovers.join('\n')}
    `;

    const prompt = `
      You are an expert crypto trader using Smart Money Concepts and Price Action. Analyze the provided market data.
      
      ${context}

      1. Provide a concise market summary.
      2. Identify 3 key risks.
      3. Give an overall outlook (Bullish/Bearish/Neutral).
      4. Suggest 6 high-probability trade setups (Mix of Longs and Shorts).
         - Analyze both Majors (BTC/ETH) and Altcoins.
         - Precise Entry Price
         - Take Profit Target
         - Stop Loss Level
         - Technical Rationale

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