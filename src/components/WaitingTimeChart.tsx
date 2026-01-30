'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MonthlyStats } from '@/types';

interface WaitingTimeChartProps {
  data: MonthlyStats[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthlyStats;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600">
          Avg Wait: <span className="font-bold">{data.avgWaitingDays} days</span>
        </p>
        <p className="text-gray-600">
          Completed: <span className="font-medium">{data.completedCount}</span> cases
          <span className="text-xs text-gray-400 ml-1">
            ({data.clearCount} clear, {data.rejectCount} reject)
          </span>
        </p>
        <p className="text-gray-600">
          Pending: <span className="font-medium">{data.pendingCount}</span> cases
          <span className="text-xs text-gray-400 ml-1">({data.pendingRatio}%)</span>
        </p>
        {!data.isReliable && (
          <p className="text-amber-600 text-xs mt-1">
            ⚠️ High pending ratio - average may be biased low
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function WaitingTimeChart({ data }: WaitingTimeChartProps) {
  // Prepare data with separate fields for reliable/unreliable
  const chartData = data.map(d => ({
    ...d,
    reliableAvg: d.isReliable ? d.avgWaitingDays : null,
    unreliableAvg: !d.isReliable ? d.avgWaitingDays : null,
  }));
  
  const unreliableCount = data.filter(d => !d.isReliable).length;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        Monthly Average Waiting Days (Completed Cases)
      </h2>
      <p className="text-xs text-gray-500 mb-3">
        Hover over points to see sample size details
        {unreliableCount > 0 && (
          <span className="text-amber-600 ml-2">
            • Orange points: &gt;50% pending (may be biased)
          </span>
        )}
      </p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              label={{ 
                value: 'Days', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ 
                value: 'Sample Size', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="right"
              dataKey="completedCount" 
              fill="#e5e7eb" 
              name="Completed Cases"
              barSize={20}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="reliableAvg"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              name="Avg Wait (reliable)"
              connectNulls
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="unreliableAvg"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#f59e0b' }}
              name="Avg Wait (high pending)"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
