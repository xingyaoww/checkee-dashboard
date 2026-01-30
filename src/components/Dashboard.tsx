'use client';

import { useState, useEffect, useMemo } from 'react';
import { CaseData } from '@/types';
import {
  loadData,
  getUniqueVisaTypes,
  getUniqueConsulates,
  filterData,
  calculateMonthlyStats,
  calculateStatusDistribution,
  getRecentMonths,
} from '@/lib/dataUtils';
import FilterPanel from './FilterPanel';
import StatsCards from './StatsCards';
import WaitingTimeChart from './WaitingTimeChart';
import StatusDistributionChart from './StatusDistributionChart';
import MonthlyBreakdownChart from './MonthlyBreakdownChart';

export default function Dashboard() {
  const [allData, setAllData] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisaType, setSelectedVisaType] = useState<string | null>(null);
  const [selectedConsulate, setSelectedConsulate] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then(setAllData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visaTypes = useMemo(() => getUniqueVisaTypes(allData), [allData]);
  const consulates = useMemo(() => getUniqueConsulates(allData), [allData]);

  const filteredData = useMemo(
    () => filterData(allData, selectedVisaType, selectedConsulate),
    [allData, selectedVisaType, selectedConsulate]
  );

  const monthlyStats = useMemo(
    () => calculateMonthlyStats(filteredData),
    [filteredData]
  );

  const recentMonthlyStats = useMemo(
    () => getRecentMonths(monthlyStats, 24),
    [monthlyStats]
  );

  const statusDistribution = useMemo(
    () => calculateStatusDistribution(filteredData),
    [filteredData]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-bold">Error loading data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            US Visa Check Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Administrative Processing Data from checkee.info
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <FilterPanel
          visaTypes={visaTypes}
          consulates={consulates}
          selectedVisaType={selectedVisaType}
          selectedConsulate={selectedConsulate}
          onVisaTypeChange={setSelectedVisaType}
          onConsulateChange={setSelectedConsulate}
        />

        <StatsCards data={filteredData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WaitingTimeChart data={recentMonthlyStats} />
          <StatusDistributionChart data={statusDistribution} />
        </div>

        <MonthlyBreakdownChart data={recentMonthlyStats} />

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Data source:{' '}
            <a
              href="https://www.checkee.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              checkee.info
            </a>
          </p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}
