import React from 'react';
import { BrainCircuit, Zap, RefreshCw, TrendingUp, TrendingDown, Target } from './Icons';
import { Opportunity, AIAnalysisResult } from '../types';

interface OpportunityFinderProps {
  opportunities: Opportunity[];
  aiAnalysis: AIAnalysisResult | null;
  loading: boolean;
  onRefreshAI: () => void;
}

export const OpportunityFinder: React.FC<OpportunityFinderProps> = ({ opportunities, aiAnalysis, loading, onRefreshAI }) => {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* AI Analysis Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-crypto-card p-5 rounded-xl border border-indigo-500/30 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <BrainCircuit size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" />
              Gemini Trade Desk
            </h3>
            <p className="text-indigo-200/70 text-sm mt-1">Smart Money Concepts & Setups</p>
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
             Analyzing market structure and identifying setups...
           </div>
        ) : (
          <div className="relative z-10 space-y-4 flex-1">
            <div className="bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/5">
              <p className="text-gray-200 text-sm leading-relaxed font-medium">
                "{aiAnalysis?.summary || "Waiting for analysis..."}"
              </p>
            </div>
            
            {/* Trade Setups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {aiAnalysis?.topTradeSetups?.map((setup, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3 hover:border-indigo-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      {setup.coin} 
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${setup.direction === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {setup.direction}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500 block">Entry</span>
                      <span className="font-mono text-gray-300">{setup.entry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Target</span>
                      <span className="font-mono text-green-400">{setup.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Stop</span>
                      <span className="font-mono text-red-400">{setup.stopLoss}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-gray-800 pt-2 mt-1">
                    {setup.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithmic Signals */}
      <div className="bg-crypto-card p-0 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden max-h-[400px]">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Anomalies
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {opportunities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No anomalies detected.</div>
          ) : (
            opportunities.map((opp, idx) => (
              <div key={idx} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 flex items-center justify-between group hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${
                    opp.type === 'BULLISH' ? 'bg-green-500' : 
                    opp.type === 'BEARISH' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      {opp.coin}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        opp.type === 'BULLISH' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>{opp.type}</span>
                    </div>
                    <div className="text-xs text-gray-400">{opp.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-mono text-gray-300">{opp.metric}</div>
                   <div className="text-xs font-bold">{opp.value}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};