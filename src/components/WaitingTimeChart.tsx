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
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Monthly Average Waiting Days (Completed Cases)
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
