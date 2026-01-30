import { CaseData, MonthlyStats, StatusDistribution } from '@/types';

export async function loadData(): Promise<CaseData[]> {
  const response = await fetch('/data/checkee_data.jsonl');
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  return lines.map(line => JSON.parse(line) as CaseData);
}

export function getUniqueVisaTypes(data: CaseData[]): string[] {
  const types = new Set(data.map(d => d.visa_type));
  return Array.from(types).sort();
}

export function getUniqueConsulates(data: CaseData[]): string[] {
  const consulates = new Set(data.map(d => d.us_consulate));
  return Array.from(consulates).sort();
}

export function filterData(
  data: CaseData[],
  visaType: string | null,
  consulate: string | null
): CaseData[] {
  return data.filter(d => {
    if (visaType && d.visa_type !== visaType) return false;
    if (consulate && d.us_consulate !== consulate) return false;
    return true;
  });
}

export function calculateMonthlyStats(data: CaseData[]): MonthlyStats[] {
  const monthMap = new Map<string, CaseData[]>();
  
  data.forEach(d => {
    const month = d.check_date.substring(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }
    monthMap.get(month)!.push(d);
  });
  
  const stats: MonthlyStats[] = [];
  
  monthMap.forEach((cases, month) => {
    // Only count completed cases for average waiting time
    const completedCases = cases.filter(
      c => c.status === 'Clear' || c.status === 'Reject'
    );
    
    const totalWaitingDays = completedCases.reduce((sum, c) => {
      const days = parseInt(c.waiting_days, 10);
      return sum + (isNaN(days) ? 0 : days);
    }, 0);
    
    const avgWaitingDays = completedCases.length > 0 
      ? totalWaitingDays / completedCases.length 
      : 0;
    
    stats.push({
      month,
      avgWaitingDays: Math.round(avgWaitingDays * 10) / 10,
      totalCases: cases.length,
      clearCount: cases.filter(c => c.status === 'Clear').length,
      rejectCount: cases.filter(c => c.status === 'Reject').length,
      pendingCount: cases.filter(c => c.status === 'Pending').length,
    });
  });
  
  return stats.sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateStatusDistribution(data: CaseData[]): StatusDistribution[] {
  const statusCount = new Map<string, number>();
  
  data.forEach(d => {
    const count = statusCount.get(d.status) || 0;
    statusCount.set(d.status, count + 1);
  });
  
  const total = data.length;
  const distribution: StatusDistribution[] = [];
  
  statusCount.forEach((count, status) => {
    distribution.push({
      status,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    });
  });
  
  return distribution.sort((a, b) => b.count - a.count);
}

export function getRecentMonths(stats: MonthlyStats[], count: number = 24): MonthlyStats[] {
  return stats.slice(-count);
}
