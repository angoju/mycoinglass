import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CoinData } from '../types';

interface LiquidationsProps {
  coins: CoinData[];
}

export const Liquidations: React.FC<LiquidationsProps> = ({ coins }) => {
  // Mock aggregation for the chart
  const data = coins.slice(0, 5).map(c => ({
    name: c.symbol,
    longs: Math.floor(c.liquidations24h * (c.shortRatio / 100)),
    shorts: Math.floor(c.liquidations24h * (c.longRatio / 100)), // Inverse logic: high long ratio usually means longs get rekt if price drops
  }));

  return (
    <div className="bg-crypto-card p-4 rounded-xl border border-gray-800 h-64 flex flex-col">
       <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded-full"></span>
          24h Liquidations
        </h3>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={20}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={40} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9'}}
              formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, '']}
            />
            <Bar dataKey="shorts" stackId="a" fill="#ef4444" name="Shorts Rekt" radius={[0, 4, 4, 0]} />
            <Bar dataKey="longs" stackId="a" fill="#10b981" name="Longs Rekt" radius={[4, 0, 0, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span className="text-gray-400">Longs Liquidated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-gray-400">Shorts Liquidated</span>
        </div>
      </div>
    </div>
  );
};