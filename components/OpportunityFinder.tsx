import React from 'react';
import { BrainCircuit, RefreshCw, Target, TrendingUp, Zap } from './Icons';
import { AIAnalysisResult, CoinData } from '../types';

interface OpportunityFinderProps {
  aiAnalysis: AIAnalysisResult | null;
  loading: boolean;
  onRefreshAI: () => void;
  coins: CoinData[];
}

export const OpportunityFinder: React.FC<OpportunityFinderProps> = ({ aiAnalysis, loading, onRefreshAI, coins }) => {
  
  // Find the single best technical signal from Real Data
  // Criteria: Highest absolute 24h change (momentum) + Consistent signals
  const bestSetup = React.useMemo(() => {
    if (!coins.length) return null;
    
    // Filter for Strong Buy or Strong Sell on 4h timeframe
    const strongMovers = coins.filter(c => c.signals['4h'] === 'STRONG_BUY' || c.signals['4h'] === 'STRONG_SELL');
    
    // Sort by volatility/momentum
    const sorted = strongMovers.sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h));
    
    return sorted.length > 0 ? sorted[0] : coins[0];
  }, [coins]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* AI Analysis Card - Takes up 3/4 width */}
      <div className="lg:col-span-3 bg-gradient-to-br from-indigo-900/40 to-crypto-card p-5 rounded-xl border border-indigo-500/30 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <BrainCircuit size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" />
              Gemini Trade Desk
            </h3>
            <p className="text-indigo-200/70 text-sm mt-1">AI-Powered Smart Money Analysis & Trade Setups</p>
          </div>
          <button 
            onClick={onRefreshAI}
            disabled={loading}
            className={`p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} className="text-indigo-300" />
          </button>
        </div>

        {loading ? (
           <div className="h-40 flex items-center justify-center text-indigo-300/50 animate-pulse">
             Analyzing real-time market structure for breakout setups...
           </div>
        ) : (
          <div className="relative z-10 space-y-4 flex-1">
            <div className="bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/5">
              <p className="text-gray-200 text-sm leading-relaxed font-medium">
                "{aiAnalysis?.summary || "Waiting for analysis..."}"
              </p>
            </div>
            
            {/* Trade Setups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {aiAnalysis?.topTradeSetups?.map((setup, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3 hover:border-indigo-500/50 transition-colors group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      {setup.coin} 
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${setup.direction === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {setup.direction}
                      </span>
                    </span>
                    <Target size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Entry</span>
                      <span className="font-mono text-gray-300">{setup.entry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Target</span>
                      <span className="font-mono text-green-400">{setup.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Stop</span>
                      <span className="font-mono text-red-400">{setup.stopLoss}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-gray-800 pt-2 mt-1 line-clamp-2" title={setup.rationale}>
                    {setup.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Best Technical Signal Card */}
      <div className="lg:col-span-1 bg-crypto-card p-0 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
        
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 relative z-10">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-400">
            <Zap className="text-blue-400" size={20} />
            Best Signal
          </h3>
          <p className="text-xs text-crypto-muted">Top Technical Mover</p>
        </div>

        {bestSetup ? (
          <div className="flex-1 p-5 flex flex-col items-center justify-center relative z-10">
             <div className="mb-4 text-center">
                <div className="text-5xl font-bold text-white mb-1">{bestSetup.symbol}</div>
                <div className={`text-xl font-mono ${bestSetup.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {bestSetup.priceChange24h > 0 ? '+' : ''}{bestSetup.priceChange24h.toFixed(2)}%
                </div>
             </div>

             <div className="w-full space-y-3">
               <div className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Signal</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs ${
                    bestSetup.signals['4h'].includes('BUY') ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                  }`}>
                    {bestSetup.signals['4h'].replace('_', ' ')}
                  </span>
               </div>
               
               <div className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Trend (4h)</span>
                  <div className="flex items-center gap-1">
                    {bestSetup.priceChange4h > 0 ? <TrendingUp size={16} className="text-green-400"/> : <TrendingUp size={16} className="text-red-400 rotate-180"/>}
                    <span className={bestSetup.priceChange4h > 0 ? 'text-green-400' : 'text-red-400'}>
                      {bestSetup.priceChange4h > 0 ? 'Bullish' : 'Bearish'}
                    </span>
                  </div>
               </div>

               <div className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Current Price</span>
                  <span className="font-mono text-white">${bestSetup.price < 10 ? bestSetup.price.toFixed(4) : bestSetup.price.toLocaleString()}</span>
               </div>
             </div>
             
             <div className="mt-6 text-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Confidence Score</span>
               <div className="w-full h-1 bg-gray-800 mt-1 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[85%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
               </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};
