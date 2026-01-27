import React from 'react';

export default function InsightsSection({ stats, range, count }) {
  const calculateRange = () => {
    if (!stats) return '0.0';
    return (stats.max_temp - stats.min_temp).toFixed(1);
  };

  const calculateAvgFromMin = () => {
    if (!stats || stats.max_temp === stats.min_temp) return '0';
    return ((stats.avg_temp - stats.min_temp) / (stats.max_temp - stats.min_temp) * 100).toFixed(0);
  };

  const getClimateCategory = () => {
    if (!stats?.avg_temp) return 'N/A';
    if (stats.avg_temp > 25) return 'Hot';
    if (stats.avg_temp > 20) return 'Warm';
    if (stats.avg_temp > 15) return 'Mild';
    if (stats.avg_temp > 10) return 'Cool';
    return 'Cold';
  };

  const getRangeLabel = () => {
    switch(range) {
      case 'hour': return 'Last hour';
      case 'day': return 'Last 24 hours';
      case 'week': return 'Last 7 days';
      default: return 'Last 24 hours';
    }
  };

  const insights = [
    {
      value: `${calculateRange()}°C`,
      label: "Temperature Range",
      description: `From ${stats?.min_temp?.toFixed(1)}°C to ${stats?.max_temp?.toFixed(1)}°C`
    },
    {
      value: `${calculateAvgFromMin()}%`,
      label: "Avg from Min",
      description: "Average relative to minimum"
    },
    {
      value: getClimateCategory(),
      label: "Climate Category",
      description: `Based on ${stats?.avg_temp?.toFixed(1)}°C average`
    }
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">📈 Insights</h3>
        <span className="text-sm text-gray-500">
          {getRangeLabel()} • {count} readings
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {insight.value}
            </div>
            <div className="font-medium text-gray-700 mb-1">{insight.label}</div>
            <div className="text-sm text-gray-500">{insight.description}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        Data updates automatically when changing time range
      </div>
    </div>
  );
}