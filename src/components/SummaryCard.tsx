import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  subtext?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  subtext,
  onClick,
  isActive = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 transition-all duration-200 shadow-sm ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow' : ''
      } ${isActive ? 'ring-2 ring-indigo-600 border-indigo-500' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtext && <div className="text-xs text-slate-500 font-medium">{subtext}</div>}
      </div>
    </div>
  );
};
