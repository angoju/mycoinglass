import { CoinData, MarketSentiment } from '../types';

// Initial seed data for top coins
const COINS = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'TRX', 'LTC', 'LINK', 'ATOM', 'UNI', 'ETC', 'FIL', 'NEAR', 'AAVE', 'QNT', 'ALGO'];

const generateRandomHistory = (startPrice: number, points: number = 24): number[] => {
  let currentPrice = startPrice;
  const history = [];
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * (startPrice * 0.02);
    currentPrice += change;
    history.push(currentPrice);
  }
  return history;
};

// Simulate fetching data from CoinGlass
export const fetchMarketData = async (): Promise<{ coins: CoinData[]; sentiment: MarketSentiment }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const sentiment: MarketSentiment = {
    fearGreedIndex: Math.floor(Math.random() * (80 - 20) + 20), // Random 20-80
    btcDominance: 52.4 + (Math.random() - 0.5),
    totalMarketCap: 2400000000000 + (Math.random() * 100000000000),
    totalVolume24h: 85000000000 + (Math.random() * 5000000000),
  };

  const coins: CoinData[] = COINS.map(symbol => {
    const basePrice = symbol === 'BTC' ? 64000 : symbol === 'ETH' ? 3400 : Math.random() * 100 + 10;
    const fundingRate = (Math.random() - 0.4) * 0.05; // Bias slightly negative/positive
    const oi = Math.random() * 1000000000 + 50000000;
    
    return {
      symbol,
      price: basePrice + (Math.random() - 0.5) * (basePrice * 0.01),
      priceChange1h: (Math.random() - 0.5) * 2,
      priceChange4h: (Math.random() - 0.5) * 5,
      priceChange24h: (Math.random() - 0.5) * 10,
      fundingRate, // 0.01% standard baseline
      openInterest: oi,
      openInterestChange1h: (Math.random() - 0.5) * 3,
      openInterestChange4h: (Math.random() - 0.5) * 8,
      longRatio: 40 + Math.random() * 20,
      shortRatio: 0, // Calculated later
      liquidations24h: Math.random() * 5000000,
      volatility: Math.random() * 100,
      history: generateRandomHistory(basePrice)
    };
  }).map(c => ({
    ...c,
    shortRatio: 100 - c.longRatio
  }));

  return { coins, sentiment };
};

export const filterOpportunities = (coins: CoinData[]) => {
  const opportunities = [];

  // 1. High Negative Funding (Potential Short Squeeze/Long Signal)
  const highNegFunding = coins.filter(c => c.fundingRate < -0.02);
  highNegFunding.forEach(c => opportunities.push({
    type: 'BULLISH',
    coin: c.symbol,
    reason: 'Negative Funding Rate',
    metric: 'Funding',
    value: `${c.fundingRate.toFixed(4)}%`
  }));

  // 2. High Positive Funding (Overcrowded Longs)
  const highPosFunding = coins.filter(c => c.fundingRate > 0.05);
  highPosFunding.forEach(c => opportunities.push({
    type: 'BEARISH',
    coin: c.symbol,
    reason: 'High Funding Rate',
    metric: 'Funding',
    value: `${c.fundingRate.toFixed(4)}%`
  }));

  // 3. OI Up + Price Down (Aggressive Shorting)
  const aggressiveShorting = coins.filter(c => c.openInterestChange1h > 2 && c.priceChange1h < -1);
  aggressiveShorting.forEach(c => opportunities.push({
    type: 'BEARISH',
    coin: c.symbol,
    reason: 'OI Rising while Price Drops',
    metric: 'OI Div',
    value: `OI +${c.openInterestChange1h.toFixed(1)}%`
  }));

  return opportunities;
};