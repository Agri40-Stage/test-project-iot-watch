import React from 'react';

export default function RangeSelector({ range, setRange }) {
  const getRangeLabel = () => {
    switch(range) {
      case 'hour': return 'Last hour';
      case 'day': return 'Last 24 hours';
      case 'week': return 'Last 7 days';
      default: return 'Last 24 hours';
    }
  };

  const periods = [
    { value: 'hour', label: 'Last hour' },
    { value: 'day', label: 'Last 24h' },
    { value: 'week', label: 'Last 7 days' }
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-lg font-semibold text-gray-700">
          Showing: <span className="text-blue-600">{getRangeLabel()}</span>
        </div>
        
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setRange(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                range === period.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}