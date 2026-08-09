import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, subtext, trend, trendValue, icon: Icon, iconBg, iconColor, rating }) => {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-border-color hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-text-secondary text-sm font-semibold mb-1 truncate" title={title}>{title}</h3>
          <p className="text-[19px] sm:text-2xl font-extrabold text-text-primary tracking-tight whitespace-nowrap">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {trendValue && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
        <span className="text-[12px] text-text-secondary font-medium">{subtext}</span>
        
        {rating && (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
