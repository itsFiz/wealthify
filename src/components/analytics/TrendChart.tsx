import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { formatCurrency } from '@/lib/calculations/index';

interface TrendData {
  month: string;
  [key: string]: any;
}

interface TrendChartProps {
  data: TrendData[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    type?: 'line' | 'area';
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  height?: number;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string) => [string, string];
}

export function TrendChart({ 
  data, 
  lines, 
  height = 300, 
  yAxisFormatter = (value) => value,
  tooltipFormatter = (value, name) => [value, name]
}: TrendChartProps) {
  const hasAreaChart = lines.some(line => line.type === 'area');
  
  if (hasAreaChart) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={yAxisFormatter} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          {lines.map((line, index) => (
            line.type === 'area' ? (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.3}
                name={line.name}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
              />
            ) : (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
              />
            )
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={yAxisFormatter} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.name}
            strokeWidth={line.strokeWidth || 2}
            strokeDasharray={line.strokeDasharray}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
} 