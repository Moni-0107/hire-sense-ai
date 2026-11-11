import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: 'purple' | 'emerald' | 'blue' | 'amber' | 'rose';
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  color = 'purple',
  height = 'h-2'
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const colorStyles = {
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-semibold text-slate-900">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out ${colorStyles[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

