export interface CaseData {
  case_id: string;
  id: string;
  visa_type: string;
  visa_entry: string;
  us_consulate: string;
  major: string;
  status: string;
  check_date: string;
  complete_date: string;
  waiting_days: string;
  month: string;
  scraped_at: string;
}

export interface MonthlyStats {
  month: string;
  avgWaitingDays: number;
  totalCases: number;
  clearCount: number;
  rejectCount: number;
  pendingCount: number;
  completedCount: number;
  pendingRatio: number;
  isReliable: boolean;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}
