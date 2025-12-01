
import React, { useState } from 'react';
import { CoinData } from '../types';

interface LiquidationsProps {
  coins: CoinData[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

type FilterType = 'ALL' | 'LONG' | 'SHORT';

export const Liquidations: React.FC<LiquidationsProps> = ({ coins }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Aggregate real-time data from all coins based on filter
  const stats = React.useMemo(() => {
    // Initialize buckets
    const result = {
      '1h': { total: 0, long: 0, short: 0 },
      '4h': { total: 0, long: 0, short: 0 },
      '12h': { total: 0, long: 0, short: 0 },
      '24h': { total: 0, long: 0, short: 0 },
    };

    coins.forEach(coin => {
      // For each timeframe
      (['1h', '4h', '12h', '24h'] as const).forEach(tf => {
        const totalLiq = coin.liquidations[tf];
        const longLiq = totalLiq * (coin.longRatio / 100);
        const shortLiq = totalLiq * (coin.shortRatio / 100);

        result[tf].total += totalLiq;
        result[tf].long += longLiq;
        result[tf].short += shortLiq;
      });
    });

    return result;
  }, [coins]);

  // Helper to get the display value based on filter
  const getDisplayValue = (tfData: { total: number, long: number, short: number }) => {
    if (filter === 'LONG') return tfData.long;
    if (filter === 'SHORT') return tfData.short;
    return tfData.total;
  };

  return (
    <div className="bg-crypto-card p-5 rounded-xl border border-gray-800 flex flex-col h-full shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
          Total Liquidations
        </h3>
        <div className="flex gap-2">
           <button 
             onClick={() => setFilter('LONG')}
             className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${filter === 'LONG' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
           >
             Long
           </button>
           <button 
             onClick={() => setFilter('SHORT')}
             className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${filter === 'SHORT' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
           >
             Short
           </button>
           <button 
             onClick={() => setFilter('ALL')}
             className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
           >
             All
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
         {/* 1h Card */}
         <RektCard 
           label="1h Rekt" 
           value={getDisplayValue(stats['1h'])} 
           data={stats['1h']} 
           filter={filter}
         />
         <RektCard 
           label="4h Rekt" 
           value={getDisplayValue(stats['4h'])} 
           data={stats['4h']} 
           filter={filter}
         />
         <RektCard 
           label="12h Rekt" 
           value={getDisplayValue(stats['12h'])} 
           data={stats['12h']} 
           filter={filter}
         />
         <RektCard 
           label="24h Rekt" 
           value={getDisplayValue(stats['24h'])} 
           data={stats['24h']} 
           filter={filter}
         />
      </div>

      <div className="mt-auto pt-4 border-t border-gray-800/50 text-xs text-gray-400 leading-relaxed">
        Showing <strong>{filter === 'ALL' ? 'Total' : filter.charAt(0) + filter.slice(1).toLowerCase()}</strong> liquidations. 
        In the past 24 hours, <span className="text-gray-200 font-bold">{(stats['24h'].total / 2850).toFixed(0)}</span> traders were liquidated. 
        The total value comes in at <span className="text-gray-200 font-bold">{formatCurrency(stats['24h'].total)}</span>.
      </div>
    </div>
  );
};

const RektCard = ({ label, value, data, filter }: { label: string, value: number, data: { total: number, long: number, short: number }, filter: FilterType }) => (
  <div className="bg-white/[0.03] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors flex flex-col justify-center">
    <div className="flex justify-between items-center mb-2">
      <span className="text-gray-400 font-semibold text-sm">{label}</span>
      {filter !== 'ALL' && <span className={`text-[10px] px-1.5 rounded ${filter === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{filter}</span>}
    </div>
    
    <div className={`text-2xl font-bold tracking-tight mb-2 ${filter === 'LONG' ? 'text-green-400' : filter === 'SHORT' ? 'text-red-400' : 'text-white'}`}>
      {formatCurrency(value)}
    </div>

    {/* Only show split if showing ALL */}
    {filter === 'ALL' && (
      <div className="space-y-1 mt-1 border-t border-white/5 pt-2">
        <div className="flex justify-between text-xs items-center">
          <span className="text-gray-500 font-medium">Long</span>
          <span className="text-emerald-500/90 font-mono">{formatCurrency(data.long)}</span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="text-gray-500 font-medium">Short</span>
          <span className="text-red-500/90 font-mono">{formatCurrency(data.short)}</span>
        </div>
      </div>
    )}
  </div>
);
