
export interface CoinData {
  symbol: string;
  price: number;
  priceChange1h: number;
  priceChange4h: number;
  priceChange24h: number;
  fundingRate: number; // In percentage, e.g., 0.01
  openInterest: number; // In USD
  openInterestChange1h: number; // Percentage
  openInterestChange4h: number; // Percentage
  longRatio: number; // 0-100
  shortRatio: number; // 0-100
  liquidations24h: number; // In USD
  volatility: number; // Arbitrary score 0-100
  history: number[]; // For sparklines
  signals: {
    '5m': SignalDirection;
    '15m': SignalDirection;
    '1h': SignalDirection;
    '4h': SignalDirection;
  };
}

export type SignalDirection = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface MarketSentiment {
  fearGreedIndex: number; // 0-100
  btcDominance: number;
  totalMarketCap: number;
  totalVolume24h: number;
}

export interface MarketDataResponse {
  coins: CoinData[];
  sentiment: MarketSentiment;
  source: 'API' | 'BACKUP';
}

export type TimeFrame = '1h' | '4h' | '12h' | '24h';

export interface Opportunity {
  type: 'BULLISH' | 'BEARISH' | 'REVERSAL' | 'HIGH_VOLATILITY';
  coin: string;
  reason: string;
  metric: string;
  value: string;
}

export interface TradeSetup {
  coin: string;
  direction: 'LONG' | 'SHORT';
  entry: string;
  target: string;
  stopLoss: string;
  rationale: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyRisks: string[];
  outlook: 'Bullish' | 'Bearish' | 'Neutral';
  topTradeSetups: TradeSetup[];
}