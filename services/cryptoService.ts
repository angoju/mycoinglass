import { CoinData, MarketSentiment, SignalDirection } from '../types';

// API Configuration
const COINCAP_API = 'https://api.coincap.io/v2/assets?limit=25';

// Robust Fallback Data (Snapshot) to ensure UI never breaks if API fails
// Prices are slightly randomized in processCoinData to mimic live market if API is down
const FALLBACK_DATA = [
  { symbol: 'BTC', priceUsd: '96450.20', changePercent24Hr: '2.45', volumeUsd24Hr: '45000000000', marketCapUsd: '1900000000000', vwap24Hr: '95000.00' },
  { symbol: 'ETH', priceUsd: '3350.15', changePercent24Hr: '-1.20', volumeUsd24Hr: '20000000000', marketCapUsd: '400000000000', vwap24Hr: '3400.00' },
  { symbol: 'SOL', priceUsd: '210.50', changePercent24Hr: '5.60', volumeUsd24Hr: '5000000000', marketCapUsd: '90000000000', vwap24Hr: '200.00' },
  { symbol: 'BNB', priceUsd: '645.20', changePercent24Hr: '0.50', volumeUsd24Hr: '1000000000', marketCapUsd: '95000000000', vwap24Hr: '644.00' },
  { symbol: 'XRP', priceUsd: '2.45', changePercent24Hr: '-3.10', volumeUsd24Hr: '3000000000', marketCapUsd: '130000000000', vwap24Hr: '2.55' },
  { symbol: 'ADA', priceUsd: '1.15', changePercent24Hr: '1.20', volumeUsd24Hr: '800000000', marketCapUsd: '40000000000', vwap24Hr: '1.13' },
  { symbol: 'DOGE', priceUsd: '0.42', changePercent24Hr: '8.50', volumeUsd24Hr: '6000000000', marketCapUsd: '60000000000', vwap24Hr: '0.39' },
  { symbol: 'AVAX', priceUsd: '45.20', changePercent24Hr: '-2.50', volumeUsd24Hr: '600000000', marketCapUsd: '18000000000', vwap24Hr: '46.50' },
  { symbol: 'SUI', priceUsd: '3.85', changePercent24Hr: '12.40', volumeUsd24Hr: '1500000000', marketCapUsd: '10000000000', vwap24Hr: '3.50' },
  { symbol: 'LINK', priceUsd: '18.50', changePercent24Hr: '1.10', volumeUsd24Hr: '400000000', marketCapUsd: '11000000000', vwap24Hr: '18.30' },
  { symbol: 'DOT', priceUsd: '8.50', changePercent24Hr: '-0.50', volumeUsd24Hr: '300000000', marketCapUsd: '12000000000', vwap24Hr: '8.55' },
  { symbol: 'UNI', priceUsd: '12.40', changePercent24Hr: '4.20', volumeUsd24Hr: '500000000', marketCapUsd: '9000000000', vwap24Hr: '11.90' },
  { symbol: 'PEPE', priceUsd: '0.000021', changePercent24Hr: '-6.50', volumeUsd24Hr: '1200000000', marketCapUsd: '8000000000', vwap24Hr: '0.000023' },
  { symbol: 'LTC', priceUsd: '115.00', changePercent24Hr: '0.10', volumeUsd24Hr: '400000000', marketCapUsd: '8500000000', vwap24Hr: '114.80' },
  { symbol: 'NEAR', priceUsd: '7.80', changePercent24Hr: '3.40', volumeUsd24Hr: '500000000', marketCapUsd: '8000000000', vwap24Hr: '7.60' },
];

// Helper to determine signal based on Real Price Action vs VWAP and Trends
const calculateSignal = (price: number, vwap: number, change24h: number, timeframeMultiplier: number): SignalDirection => {
  const deviation = (price - vwap) / vwap; 
  const momentum = change24h / 100; 
  const score = (deviation * 2) + (momentum * timeframeMultiplier);

  if (score > 0.04) return 'STRONG_BUY';
  if (score > 0.01) return 'BUY';
  if (score < -0.04) return 'STRONG_SELL';
  if (score < -0.01) return 'SELL';
  return 'NEUTRAL';
};

const generateMockHistory = (currentPrice: number, change24h: number): number[] => {
  const history = [];
  // Use a more stable generation for 1s updates to prevent flickering
  // We project backwards from current price
  let price = currentPrice;
  const steps = 24;
  
  // Create a trend based on 24h change
  const trendStep = (currentPrice * (change24h / 100)) / steps;

  for (let i = 0; i < steps; i++) {
    // Reduce noise significantly for 1s updates
    const noise = (Math.random() - 0.5) * (currentPrice * 0.005); 
    history.unshift(price + noise); // Unshift to build backwards
    price -= trendStep; 
  }
  return history;
};

// Internal Processor
const processCoinData = (rawCoins: any[], isFallback: boolean = false) => {
  let totalCap = 0;
  let totalVol = 0;
  
  const coins: CoinData[] = rawCoins.map((coin: any) => {
    let price = parseFloat(coin.priceUsd);
    
    // LIVE TICKER SIMULATION: 
    // If we are using fallback data (due to API rate limit), add micro-jitter 
    // so the dashboard still feels "alive" like Binance.
    if (isFallback) {
      // Random walk: +/- 0.05%
      const jitter = 1 + (Math.random() * 0.001 - 0.0005);
      price = price * jitter;
    }

    const vwap = parseFloat(coin.vwap24Hr) || price;
    const change24h = parseFloat(coin.changePercent24Hr);
    const marketCap = parseFloat(coin.marketCapUsd);
    const volume = parseFloat(coin.volumeUsd24Hr);

    if (!isNaN(marketCap)) totalCap += marketCap;
    if (!isNaN(volume)) totalVol += volume;

    // Derived Metrics Logic (Modelled on real price action)
    const volatilityScore = Math.abs(change24h);
    
    // Funding Rate Model
    const fundingRate = (change24h * 0.012) + ((Math.random() - 0.5) * 0.005);
    
    // Open Interest Model
    const oiBase = volume * 0.15; 
    const openInterest = oiBase * (1 + (Math.random() * 0.1));

    // Liquidation Model
    const liquidationFactor = volatilityScore > 5 ? 0.05 : 0.01;
    const liquidations24h = volume * liquidationFactor;

    return {
      symbol: coin.symbol,
      price: price,
      priceChange1h: change24h / 12 + (Math.random() - 0.5), 
      priceChange4h: change24h / 4 + (Math.random() - 0.5),
      priceChange24h: change24h,
      fundingRate: parseFloat(fundingRate.toFixed(4)),
      openInterest: openInterest,
      openInterestChange1h: (Math.random() - 0.5) * 1.5,
      openInterestChange4h: (Math.random() - 0.5) * 3,
      longRatio: 50 + (change24h * 1.5), 
      shortRatio: 50 - (change24h * 1.5),
      liquidations24h: liquidations24h,
      volatility: volatilityScore,
      history: generateMockHistory(price, change24h),
      signals: {
        '5m': calculateSignal(price, vwap, change24h, 0.4), 
        '15m': calculateSignal(price, vwap, change24h, 0.8),
        '1h': calculateSignal(price, vwap, change24h, 1.5),
        '4h': calculateSignal(price, vwap, change24h, 3.0),
      }
    };
  });

  // Safe BTC Dominance Calc
  let btcDominance = 0;
  const btcCoin = rawCoins.find((c: any) => c.symbol === 'BTC');
  if (btcCoin && totalCap > 0) {
     btcDominance = (parseFloat(btcCoin.marketCapUsd) / totalCap) * 100;
  } else {
    btcDominance = 52.5; 
  }

  // Sentiment Algo
  const avgChange = coins.reduce((acc, c) => acc + c.priceChange24h, 0) / (coins.length || 1);
  let fearGreed = 50 + (avgChange * 8); 
  fearGreed = Math.max(15, Math.min(95, fearGreed));

  return {
    coins,
    sentiment: {
      fearGreedIndex: Math.floor(fearGreed),
      btcDominance: btcDominance,
      totalMarketCap: totalCap,
      totalVolume24h: totalVol,
    }
  };
};

// Main Fetch Function with Fail-Safe
export const fetchMarketData = async (): Promise<{ coins: CoinData[]; sentiment: MarketSentiment; source: 'API' | 'BACKUP' }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Tight 2s timeout for live feel

    const response = await fetch(COINCAP_API, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error("Invalid Data Structure");
    }

    const processed = processCoinData(data.data, false);
    return { ...processed, source: 'API' };

  } catch (error) {
    // Silent fail to backup, common with 1s polling intervals on public APIs
    // Return Fallback Data with jitter so UI never breaks and looks alive
    const processed = processCoinData(FALLBACK_DATA, true);
    return { ...processed, source: 'BACKUP' };
  }
};