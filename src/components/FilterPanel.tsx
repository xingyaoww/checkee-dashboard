'use client';

interface FilterPanelProps {
  visaTypes: string[];
  consulates: string[];
  selectedVisaType: string | null;
  selectedConsulate: string | null;
  onVisaTypeChange: (value: string | null) => void;
  onConsulateChange: (value: string | null) => void;
}

export default function FilterPanel({
  visaTypes,
  consulates,
  selectedVisaType,
  selectedConsulate,
  onVisaTypeChange,
  onConsulateChange,
}: FilterPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visa Type
          </label>
          <select
            value={selectedVisaType || ''}
            onChange={(e) => onVisaTypeChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Visa Types</option>
            {visaTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            US Consulate
          </label>
          <select
            value={selectedConsulate || ''}
            onChange={(e) => onConsulateChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Consulates</option>
            {consulates.map((consulate) => (
              <option key={consulate} value={consulate}>
                {consulate}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
