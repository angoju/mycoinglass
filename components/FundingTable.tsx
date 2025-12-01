import React from 'react';
import { CoinData } from '../types';

interface FundingTableProps {
  coins: CoinData[];
}

export const FundingTable: React.FC<FundingTableProps> = ({ coins }) => {
  // Sort by absolute funding rate to show most extreme
  const sortedCoins = [...coins].sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate)).slice(0, 8);

  return (
    <div className="bg-crypto-card rounded-xl border border-gray-800 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
          Funding Heatmap (Top 8)
        </h3>
        <span className="text-xs text-crypto-muted">Pred. 8h Rate</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900/50 text-crypto-muted font-medium">
            <tr>
              <th className="p-3">Coin</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Funding</th>
              <th className="p-3 text-right">Signal</th>
            </tr>
          </thead>
          <tbody>
            {sortedCoins.map((coin) => {
              const isHighPos = coin.fundingRate > 0.02;
              const isHighNeg = coin.fundingRate < -0.02;
              
              return (
                <tr key={coin.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 font-medium text-crypto-accent">{coin.symbol}</td>
                  <td className="p-3 text-right">${coin.price.toFixed(coin.price < 10 ? 4 : 2)}</td>
                  <td className={`p-3 text-right font-mono font-bold ${coin.fundingRate > 0 ? 'text-orange-400' : 'text-crypto-green'}`}>
                    {coin.fundingRate > 0 ? '+' : ''}{coin.fundingRate.toFixed(4)}%
                  </td>
                  <td className="p-3 text-right">
                    {isHighPos && <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">Crowded Longs</span>}
                    {isHighNeg && <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Short Squeeze</span>}
                    {!isHighPos && !isHighNeg && <span className="text-gray-500">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};