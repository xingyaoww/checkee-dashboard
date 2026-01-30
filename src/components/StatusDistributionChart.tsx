'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieLabelRenderProps,
} from 'recharts';
import { StatusDistribution } from '@/types';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
}

const COLORS: Record<string, string> = {
  Clear: '#22c55e',
  Reject: '#ef4444',
  Pending: '#f59e0b',
};

const DEFAULT_COLOR = '#94a3b8';

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { name, payload } = props;
  const percentage = (payload as StatusDistribution)?.percentage;
  return `${name}: ${percentage}%`;
};

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Case Status Distribution
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="status"
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status] || DEFAULT_COLOR} 
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} cases`,
                'Count',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
