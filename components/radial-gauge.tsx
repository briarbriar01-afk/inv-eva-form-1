'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadialGaugeProps {
  yesCount: number;
  total: number;
}

export function RadialGauge({ yesCount, total }: RadialGaugeProps) {
  const percentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  const color =
    percentage >= 85 ? '#16a34a' :
    percentage >= 60 ? '#ca8a04' :
    '#dc2626';

  const label =
    percentage >= 85 ? 'زۆر باش' :
    percentage >= 60 ? 'باش' :
    'پێویستی بە باشترکردن هەیە';

  const data = [{ value: percentage }];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="90%"
            barSize={14}
            data={data}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            {/* Background track */}
            <RadialBar
              background={{ fill: '#f1f5f9' }}
              dataKey="value"
              angleAxisId={0}
              fill={color}
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
          <span className="text-xs text-muted-foreground rtl-text">{yesCount}/{total}</span>
        </div>
      </div>

      {/* Status badge */}
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full rtl-text"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {label}
      </span>
    </div>
  );
}
