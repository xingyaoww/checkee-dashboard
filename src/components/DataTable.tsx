'use client';

import { useState, useMemo } from 'react';
import { CaseData } from '@/types';

interface DataTableProps {
  data: CaseData[];
}

const PAGE_SIZE = 50;

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof CaseData>('check_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortField === 'waiting_days') {
        const aNum = parseInt(aVal, 10) || 0;
        const bNum = parseInt(bVal, 10) || 0;
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = sortedData.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSort = (field: keyof CaseData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof CaseData) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Clear':
        return 'bg-green-100 text-green-800';
      case 'Reject':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: { key: keyof CaseData; label: string; width: string }[] = [
    { key: 'visa_type', label: 'Visa Type', width: 'w-20' },
    { key: 'visa_entry', label: 'Entry', width: 'w-20' },
    { key: 'us_consulate', label: 'Consulate', width: 'w-28' },
    { key: 'major', label: 'Major', width: 'w-40' },
    { key: 'status', label: 'Status', width: 'w-24' },
    { key: 'check_date', label: 'Check Date', width: 'w-28' },
    { key: 'complete_date', label: 'Complete Date', width: 'w-28' },
    { key: 'waiting_days', label: 'Wait Days', width: 'w-24' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Raw Data ({data.length.toLocaleString()} cases)
        </h2>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.width} px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className="text-gray-400">{getSortIcon(col.key)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={`${row.case_id}-${index}`} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.visa_type}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.visa_entry}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.us_consulate}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate" title={row.major}>
                  {row.major}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.check_date}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.complete_date === '0000-00-00' ? '-' : row.complete_date}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.status === 'Pending' ? '-' : row.waiting_days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, sortedData.length)} of {sortedData.length.toLocaleString()} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
