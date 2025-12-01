import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, trend, icon, className }) => {
  const trendColor = trend === 'up' ? 'text-crypto-green' : trend === 'down' ? 'text-crypto-red' : 'text-crypto-muted';
  
  return (
    <div className={`bg-crypto-card p-4 rounded-xl border border-gray-800 shadow-lg ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-crypto-muted text-sm font-medium">{title}</span>
        {icon && <div className="text-crypto-accent">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-crypto-text">{value}</span>
        {subValue && (
          <span className={`text-sm mb-1 font-medium ${trendColor}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};