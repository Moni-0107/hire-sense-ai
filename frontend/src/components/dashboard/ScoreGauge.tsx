import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  title: string;
  subtitle?: string;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  title,
  subtitle,
  size = 180
}) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#7C3AED'; // Purple
  let statusText = 'Excellent';
  let badgeBg = 'bg-purple-100 text-purple-800';

  if (score < 50) {
    color = '#F43F5E';
    statusText = 'Needs Work';
    badgeBg = 'bg-rose-100 text-rose-800';
  } else if (score < 75) {
    color = '#F59E0B';
    statusText = 'Average';
    badgeBg = 'bg-amber-100 text-amber-800';
  } else if (score >= 85) {
    color = '#10B981';
    statusText = 'Top Tier';
    badgeBg = 'bg-emerald-100 text-emerald-800';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{Math.round(score)}</span>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">/ 100</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${badgeBg}`}>
            {statusText}
          </span>
        </div>
      </div>
      <h4 className="mt-3 font-semibold text-slate-800 text-sm text-center">{title}</h4>
      {subtitle && <p className="text-xs text-slate-500 text-center mt-0.5">{subtitle}</p>}
    </div>
  );
};

