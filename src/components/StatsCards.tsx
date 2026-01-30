'use client';

import { CaseData } from '@/types';

interface StatsCardsProps {
  data: CaseData[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalCases = data.length;
  const clearCases = data.filter((d) => d.status === 'Clear').length;
  const rejectCases = data.filter((d) => d.status === 'Reject').length;
  const pendingCases = data.filter((d) => d.status === 'Pending').length;
  
  const completedCases = data.filter(
    (d) => d.status === 'Clear' || d.status === 'Reject'
  );
  
  const avgWaitingDays =
    completedCases.length > 0
      ? completedCases.reduce((sum, d) => {
          const days = parseInt(d.waiting_days, 10);
          return sum + (isNaN(days) ? 0 : days);
        }, 0) / completedCases.length
      : 0;

  const clearRate = totalCases > 0 
    ? ((clearCases / (clearCases + rejectCases || 1)) * 100).toFixed(1)
    : '0';

  const cards = [
    {
      title: 'Total Cases',
      value: totalCases.toLocaleString(),
      color: 'bg-blue-500',
    },
    {
      title: 'Cleared',
      value: clearCases.toLocaleString(),
      color: 'bg-green-500',
    },
    {
      title: 'Rejected',
      value: rejectCases.toLocaleString(),
      color: 'bg-red-500',
    },
    {
      title: 'Pending',
      value: pendingCases.toLocaleString(),
      color: 'bg-yellow-500',
    },
    {
      title: 'Avg Wait (Days)',
      value: avgWaitingDays.toFixed(1),
      color: 'bg-purple-500',
    },
    {
      title: 'Clear Rate',
      value: `${clearRate}%`,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} rounded-lg shadow p-4 text-white`}
        >
          <p className="text-sm opacity-90">{card.title}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
