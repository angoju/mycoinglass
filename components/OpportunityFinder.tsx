import React, { useState, useEffect } from 'react';
import { BrainCircuit, Zap, AlertTriangle, RefreshCw } from './Icons';
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
      <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-crypto-card p-5 rounded-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <BrainCircuit size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" />
              Gemini Market Analyst
            </h3>
            <p className="text-indigo-200/70 text-sm mt-1">Real-time sentiment synthesis powered by Gemini 2.5 Flash</p>
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
           <div className="h-32 flex items-center justify-center text-indigo-300/50 animate-pulse">
             Analyzing market structure...
           </div>
        ) : (
          <div className="relative z-10 space-y-4">
            <div className="bg-black/20 p-4 rounded-lg backdrop-blur-sm border border-white/5">
              <p className="text-gray-200 leading-relaxed font-medium">
                "{aiAnalysis?.summary || "Waiting for analysis..."}"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                aiAnalysis?.outlook === 'Bullish' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                aiAnalysis?.outlook === 'Bearish' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                'bg-gray-500/20 border-gray-500/50 text-gray-400'
              }`}>
                Outlook: {aiAnalysis?.outlook || 'NEUTRAL'}
              </span>
              
              {aiAnalysis?.keyRisks.map((risk, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithmic Signals */}
      <div className="bg-crypto-card p-0 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Algo Signals
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[220px]">
          {opportunities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No strong signals detected.</div>
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