import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MatchHistoryChartProps {
  history?: Array<{ target: string; score: number; date: string }>;
}

export const MatchHistoryChart: React.FC<MatchHistoryChartProps> = ({ history }) => {
  const defaultHistory = [
    { target: 'Frontend Dev', score: 72, date: 'Nov 01' },
    { target: 'Full-Stack Eng', score: 81, date: 'Nov 04' },
    { target: 'Cloud Eng', score: 78, date: 'Nov 07' },
    { target: 'Senior Full-Stack', score: 91, date: 'Nov 10' },
  ];

  const data = history && history.length > 0 ? history : defaultHistory;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
          <YAxis domain={[40, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Compatibility %"
            stroke="#6366F1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#scoreGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

