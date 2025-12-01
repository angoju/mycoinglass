import React from 'react';
import { CoinData, SignalDirection } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TradingSignalsProps {
  coins: CoinData[];
}

const SignalBadge: React.FC<{ signal: SignalDirection }> = ({ signal }) => {
  const styles = {
    'STRONG_BUY': 'bg-green-500 text-black border-green-400',
    'BUY': 'bg-green-500/20 text-green-400 border-green-500/30',
    'NEUTRAL': 'bg-gray-700/50 text-gray-400 border-gray-600',
    'SELL': 'bg-red-500/20 text-red-400 border-red-500/30',
    'STRONG_SELL': 'bg-red-500 text-white border-red-400',
  };

  const labels = {
    'STRONG_BUY': 'STRONG BUY',
    'BUY': 'BUY',
    'NEUTRAL': 'NEUTRAL',
    'SELL': 'SELL',
    'STRONG_SELL': 'STRONG SELL',
  };

  return (
    <div className={`px-2 py-1 rounded text-[10px] font-bold border text-center min-w-[80px] ${styles[signal]}`}>
      {labels[signal]}
    </div>
  );
};

export const TradingSignals: React.FC<TradingSignalsProps> = ({ coins }) => {
  // Separate Majors (BTC/ETH) from others
  const majors = coins.filter(c => ['BTC', 'ETH', 'SOL'].includes(c.symbol));
  const alts = coins.filter(c => !['BTC', 'ETH', 'SOL'].includes(c.symbol));

  return (
    <div className="bg-crypto-card rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-6 bg-crypto-accent rounded-full"></span>
          Signal Matrix
        </h3>
        <div className="flex gap-2 text-xs text-crypto-muted">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Buy</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Sell</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900/50 text-crypto-muted font-medium text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3 pl-4">Asset</th>
              <th className="p-3 text-center">5m Scalp</th>
              <th className="p-3 text-center">15m Intra</th>
              <th className="p-3 text-center">1h Swing</th>
              <th className="p-3 text-center">4h Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {/* Majors Section */}
            {majors.map(coin => (
              <tr key={coin.symbol} className="bg-gray-800/20 hover:bg-gray-800/40 transition-colors">
                <td className="p-3 pl-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-base text-white">{coin.symbol}</span>
                    <span className="text-xs text-crypto-muted">${coin.price.toLocaleString()}</span>
                  </div>
                </td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['5m']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['15m']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['1h']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['4h']} /></td>
              </tr>
            ))}
            
            {/* Divider */}
            <tr><td colSpan={5} className="bg-gray-900/80 p-1"></td></tr>

            {/* Alts Section */}
            {alts.slice(0, 5).map(coin => (
              <tr key={coin.symbol} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-3 pl-4 font-medium text-crypto-text">{coin.symbol}</td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['5m']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['15m']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['1h']} /></td>
                <td className="p-3 text-center"><SignalBadge signal={coin.signals['4h']} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 text-center text-xs text-gray-500 bg-gray-900/30 border-t border-gray-800">
        Signals based on Price Action, Momentum & OI Convergence
      </div>
    </div>
  );
};