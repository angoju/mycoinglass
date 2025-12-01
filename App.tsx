import React, { useEffect, useState, useCallback } from 'react';
import { fetchMarketData, filterOpportunities } from './services/cryptoService';
import { analyzeMarket } from './services/geminiService';
import { CoinData, MarketSentiment, Opportunity, AIAnalysisResult } from './types';
import { MetricCard } from './components/MetricCard';
import { Liquidations } from './components/Liquidations';
import { FundingTable } from './components/FundingTable';
import { OpportunityFinder } from './components/OpportunityFinder';
import { Activity, BarChart2, TrendingUp, RefreshCw, AlertTriangle } from './components/Icons';
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';

function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchMarketData();
      setCoins(data.coins);
      setSentiment(data.sentiment);
      setOpportunities(filterOpportunities(data.coins));
      setLastUpdated(new Date());
      return data;
    } catch (e) {
      console.error("Failed to fetch data", e);
      return null;
    }
  }, []);

  const runAIAnalysis = useCallback(async () => {
    if (!coins.length || !sentiment) return;
    setLoadingAI(true);
    try {
      const result = await analyzeMarket(coins, sentiment);
      setAiAnalysis(result);
    } finally {
      setLoadingAI(false);
    }
  }, [coins, sentiment]);

  // Initial load
  useEffect(() => {
    loadData().then((data) => {
      if(data) {
        // Run AI analysis once on mount after data is ready
         analyzeMarket(data.coins, data.sentiment).then(setAiAnalysis);
      }
    });
  }, [loadData]);

  // Auto-refresh interval (30s)
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, loadData]);

  const toggleAutoRefresh = () => setIsAutoRefresh(!isAutoRefresh);

  if (!sentiment) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center text-crypto-accent">
        <RefreshCw className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // Fear & Greed Color
  const fgColor = sentiment.fearGreedIndex > 70 ? 'text-green-500' : sentiment.fearGreedIndex < 30 ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className="min-h-screen bg-crypto-dark text-crypto-text p-4 md:p-6 lg:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Sentinels
          </h1>
          <p className="text-crypto-muted text-sm mt-1">
            Real-time Market Sentiment & Volatility Monitor
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-xs text-right hidden sm:block">
            <div className="text-crypto-muted">Last Update</div>
            <div className="font-mono text-crypto-accent">{lastUpdated.toLocaleTimeString()}</div>
          </div>
          <button 
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isAutoRefresh 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            {isAutoRefresh ? 'Live' : 'Paused'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-6">
        
        {/* Top Level Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Fear & Greed" 
            value={sentiment.fearGreedIndex} 
            icon={<Activity size={20} />} 
            className="border-t-4 border-t-yellow-500" // Styled dynamically usually
            subValue={sentiment.fearGreedIndex > 50 ? "Greed" : "Fear"}
            trend="neutral"
          />
          <MetricCard 
            title="BTC Dominance" 
            value={`${sentiment.btcDominance.toFixed(1)}%`} 
            icon={<BarChart2 size={20} />} 
          />
          <MetricCard 
            title="Global Vol 24h" 
            value={`$${(sentiment.totalVolume24h / 1000000000).toFixed(1)}B`} 
            icon={<TrendingUp size={20} />} 
          />
           <div className="bg-crypto-card p-4 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-crypto-muted text-sm font-medium mb-1">Market State</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                   {aiAnalysis?.outlook || 'Analyzing...'}
                </div>
                <div className="text-xs text-indigo-300 mt-1">Based on Gemini AI</div>
              </div>
           </div>
        </div>

        {/* AI & Opportunity Section */}
        <OpportunityFinder 
          opportunities={opportunities} 
          aiAnalysis={aiAnalysis} 
          loading={loadingAI}
          onRefreshAI={runAIAnalysis}
        />

        {/* Main Data Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
          
          {/* Left: Funding Rates */}
          <div className="lg:col-span-1 h-96">
            <FundingTable coins={coins} />
          </div>

          {/* Center: Open Interest Monitor (Sparklines) */}
          <div className="lg:col-span-1 h-96 bg-crypto-card rounded-xl border border-gray-800 flex flex-col">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                OI Trend (1H)
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {coins.slice(0, 7).map(coin => (
                <div key={coin.symbol} className="p-2 hover:bg-gray-800/50 rounded flex items-center justify-between">
                  <div className="w-20">
                    <div className="font-bold text-sm">{coin.symbol}</div>
                    <div className="text-xs text-gray-500">${coin.price.toFixed(2)}</div>
                  </div>
                  <div className="h-10 w-24">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.history.map((v, i) => ({i, v}))}>
                           <Line type="monotone" dataKey="v" stroke={coin.priceChange1h > 0 ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="text-right w-20">
                     <div className={`text-sm font-bold ${coin.openInterestChange1h > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                       {coin.openInterestChange1h > 0 ? '+' : ''}{coin.openInterestChange1h.toFixed(2)}%
                     </div>
                     <div className="text-[10px] text-gray-500">OI Change</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Liquidations */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Liquidations coins={coins} />
            
            {/* Mini Heatmap Grid */}
             <div className="flex-1 bg-crypto-card p-4 rounded-xl border border-gray-800">
                <h3 className="font-semibold text-sm mb-3 text-gray-400">1H Price Heatmap</h3>
                <div className="grid grid-cols-5 gap-2">
                   {coins.slice(0, 20).map(coin => (
                     <div 
                      key={coin.symbol} 
                      className={`aspect-square rounded flex items-center justify-center text-xs font-bold cursor-help transition-transform hover:scale-105 ${
                        coin.priceChange1h > 1.5 ? 'bg-green-500 text-black' :
                        coin.priceChange1h > 0 ? 'bg-green-500/30 text-green-300' :
                        coin.priceChange1h < -1.5 ? 'bg-red-500 text-white' :
                        'bg-red-500/30 text-red-300'
                      }`}
                      title={`${coin.symbol}: ${coin.priceChange1h.toFixed(2)}%`}
                     >
                       {coin.symbol}
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;