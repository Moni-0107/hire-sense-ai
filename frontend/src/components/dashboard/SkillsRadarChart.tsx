import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface SkillsRadarChartProps {
  data?: Array<{ subject: string; A: number; fullMark: number }>;
}

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ data }) => {
  const defaultData = [
    { subject: 'Languages', A: 90, fullMark: 100 },
    { subject: 'Frontend', A: 85, fullMark: 100 },
    { subject: 'Backend', A: 92, fullMark: 100 },
    { subject: 'Databases', A: 88, fullMark: 100 },
    { subject: 'Cloud/DevOps', A: 78, fullMark: 100 },
    { subject: 'Impact/Metrics', A: 84, fullMark: 100 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fontSize: 9 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              borderRadius: '8px',
              border: 'none',
              color: '#F8FAFC',
              fontSize: '12px'
            }}
          />
          <Radar
            name="Proficiency"
            dataKey="A"
            stroke="#7C3AED"
            fill="#8B5CF6"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

