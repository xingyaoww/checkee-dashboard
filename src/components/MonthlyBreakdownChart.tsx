'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyStats } from '@/types';

interface MonthlyBreakdownChartProps {
  data: MonthlyStats[];
}

export default function MonthlyBreakdownChart({ data }: MonthlyBreakdownChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Monthly Case Results Breakdown
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              label={{ 
                value: 'Cases', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="clearCount" stackId="a" fill="#22c55e" name="Clear" />
            <Bar dataKey="rejectCount" stackId="a" fill="#ef4444" name="Reject" />
            <Bar dataKey="pendingCount" stackId="a" fill="#f59e0b" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
