'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyStats } from '@/types';

interface WaitingTimeChartProps {
  data: MonthlyStats[];
}

export default function WaitingTimeChart({ data }: WaitingTimeChartProps) {
  // Filter out months with unreliable data (avgWaitingDays = -1 means >50% pending)
  const reliableData = data.filter(d => d.avgWaitingDays >= 0);
  const excludedCount = data.length - reliableData.length;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        Monthly Average Waiting Days (Completed Cases)
      </h2>
      {excludedCount > 0 && (
        <p className="text-sm text-amber-600 mb-2">
          ⚠️ {excludedCount} recent month(s) excluded due to &gt;50% pending cases (unreliable average)
        </p>
      )}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reliableData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              label={{ 
                value: 'Days', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              formatter={(value) => [`${value} days`, 'Avg Waiting']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgWaitingDays"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Avg Waiting Days"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
