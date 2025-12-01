
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchMarketData } from './services/cryptoService';
import { analyzeMarket } from './services/geminiService';
import { CoinData, MarketSentiment, AIAnalysisResult, MarketDataResponse, TimeFrame } from './types';
import { MetricCard } from './components/MetricCard';
import { Liquidations } from './components/Liquidations';
import { FundingTable } from './components/FundingTable';
import { OpportunityFinder } from './components/OpportunityFinder';
import { TradingSignals } from './components/TradingSignals';
import { Activity, BarChart2, TrendingUp, RefreshCw, Zap, AlertTriangle } from './components/Icons';

function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [dataSource, setDataSource] = useState<'API' | 'BACKUP'>('API');
  const [timeframe, setTimeframe] = useState<TimeFrame>('24h');
  
  // Prevent overlapping fetches if API is slow
  const isFetchingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return null;
    isFetchingRef.current = true;
    
    try {
      const data: MarketDataResponse = await fetchMarketData();
      setCoins(data.coins);
      setSentiment(data.sentiment);
      setDataSource(data.source);
      setLastUpdated(new Date());
      return data;
    } catch (e) {
      console.error("Failed to fetch data", e);
      return null;
    } finally {
      isFetchingRef.current = false;
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

  // Auto-refresh interval (1s for Binance-like feel)
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 1000); 
    return () => clearInterval(interval);
  }, [isAutoRefresh, loadData]);

  const toggleAutoRefresh = () => setIsAutoRefresh(!isAutoRefresh);

  // Helper for heatmap colors
  const getHeatmapColor = (change: number) => {
    if (change > 3) return 'bg-emerald-500 text-black';
    if (change > 0.5) return 'bg-emerald-500/80 text-white';
    if (change > 0) return 'bg-emerald-500/40 text-emerald-100';
    if (change < -3) return 'bg-red-500 text-white';
    if (change < -0.5) return 'bg-red-500/80 text-white';
    return 'bg-red-500/40 text-red-100';
  };

  const formatHeatmapValue = (val: number) => {
    if (val > 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${(val / 1000).toFixed(0)}K`;
  };

  // Helper to get correct data based on selected timeframe
  const getCoinMetrics = (coin: CoinData) => {
    const liq = coin.liquidations[timeframe] || 0;
    let change = 0;
    switch(timeframe) {
      case '1h': change = coin.priceChange1h; break;
      case '4h': change = coin.priceChange4h; break;
      case '12h': change = coin.priceChange12h; break;
      case '24h': change = coin.priceChange24h; break;
    }
    return { liq, change };
  };

  if (!sentiment) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center text-crypto-accent flex-col gap-4">
        <RefreshCw className="animate-spin w-10 h-10" />
        <span className="font-mono text-sm tracking-wider">INITIALIZING LIVE FEED...</span>
      </div>
    );
  }

  // Pre-calculate metrics for Heatmap render to avoid clutter
  const coinMetrics = coins.map(c => ({
    symbol: c.symbol,
    ...getCoinMetrics(c)
  }));

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
        <div className="flex flex-wrap items-center gap-4">
           {dataSource === 'BACKUP' && (
             <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-xs font-bold animate-pulse">
               <AlertTriangle size={12} />
               SIMULATED LIVE
             </div>
           )}
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
            className={`border-t-4 ${sentiment.fearGreedIndex > 50 ? 'border-t-green-500' : 'border-t-red-500'}`}
            subValue={sentiment.fearGreedIndex > 60 ? "Greed" : sentiment.fearGreedIndex < 40 ? "Fear" : "Neutral"}
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
                <div className="text-crypto-muted text-sm font-medium mb-1">Market Bias</div>
                <div className={`text-xl font-bold flex items-center gap-2 ${aiAnalysis?.outlook === 'Bullish' ? 'text-green-400' : aiAnalysis?.outlook === 'Bearish' ? 'text-red-400' : 'text-white'}`}>
                   {aiAnalysis?.outlook || 'Analyzing...'}
                </div>
                <div className="text-xs text-indigo-300 mt-1">Based on Gemini AI</div>
              </div>
           </div>
        </div>

        {/* AI & Opportunity Section */}
        <OpportunityFinder 
          aiAnalysis={aiAnalysis} 
          loading={loadingAI}
          onRefreshAI={runAIAnalysis}
          coins={coins}
        />

        {/* Main Data Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
          
          {/* Left: Trading Signals (EXPANDED to 2 cols) */}
          <div className="lg:col-span-2 h-[28rem]">
             <TradingSignals coins={coins} />
          </div>

          {/* Right: Funding & Liquidations */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-[28rem]">
            <FundingTable coins={coins} />
          </div>

        </div>

        {/* Bottom Section: Heatmap & Liquidations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto md:h-[22rem]">
            {/* Left: Heatmap */}
            <div className="bg-crypto-card p-5 rounded-xl border border-gray-800 flex flex-col overflow-hidden shadow-lg h-[22rem]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                      Liquidation Heatmap
                  </h3>
                   <div className="flex gap-2 text-xs">
                     {(['1h', '4h', '12h', '24h'] as TimeFrame[]).map(tf => (
                        <button 
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-2 py-1 rounded font-medium transition-colors ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {tf.replace('h', ' hour')}
                        </button>
                     ))}
                   </div>
                </div>

                {/* Simulated Treemap Grid */}
                <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-1.5 min-h-0">
                     {/* BTC Block - Large Left */}
                     <div className={`col-span-2 row-span-4 rounded-lg p-4 flex flex-col justify-center items-center transition-all hover:brightness-110 cursor-pointer ${getHeatmapColor(coinMetrics[0]?.change || 0)}`}>
                        <span className="text-3xl font-bold mb-1">{coinMetrics[0]?.symbol}</span>
                        <span className="text-lg font-mono opacity-90">{formatHeatmapValue(coinMetrics[0]?.liq || 0)}</span>
                     </div>
                     
                     {/* ETH Block - Top Right */}
                     <div className={`col-span-2 row-span-2 rounded-lg p-3 flex flex-col justify-center items-center transition-all hover:brightness-110 cursor-pointer ${getHeatmapColor(coinMetrics[1]?.change || 0)}`}>
                        <span className="text-2xl font-bold mb-1">{coinMetrics[1]?.symbol}</span>
                         <span className="text-sm font-mono opacity-90">{formatHeatmapValue(coinMetrics[1]?.liq || 0)}</span>
                     </div>
                     
                     {/* Mid-tier Coins */}
                     <div className={`col-span-1 row-span-1 rounded-lg flex flex-col justify-center items-center transition-all hover:brightness-110 ${getHeatmapColor(coinMetrics[2]?.change || 0)}`}>
                         <span className="text-xs font-bold">{coinMetrics[2]?.symbol}</span>
                         <span className="text-[10px] opacity-80">{formatHeatmapValue(coinMetrics[2]?.liq || 0)}</span>
                     </div>
                     <div className={`col-span-1 row-span-1 rounded-lg flex flex-col justify-center items-center transition-all hover:brightness-110 ${getHeatmapColor(coinMetrics[3]?.change || 0)}`}>
                         <span className="text-xs font-bold">{coinMetrics[3]?.symbol}</span>
                         <span className="text-[10px] opacity-80">{formatHeatmapValue(coinMetrics[3]?.liq || 0)}</span>
                     </div>
                     
                     {/* Small Coins Row */}
                     {coinMetrics.slice(4, 8).map((c, i) => (
                       <div key={c.symbol} className={`col-span-1 row-span-1 rounded-lg flex flex-col justify-center items-center transition-all hover:brightness-110 ${getHeatmapColor(c.change)}`}>
                           <span className="text-xs font-bold">{c.symbol}</span>
                       </div>
                     ))}
                </div>
            </div>

            {/* Right: Total Liquidations Grid */}
            <div className="h-[22rem]">
               <Liquidations coins={coins} />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
