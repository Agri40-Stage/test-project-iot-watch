import React from 'react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Minimum",
      value: stats?.min_temp?.toFixed(1),
      unit: "°C",
      description: "Lowest recorded temperature",
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-100",
      textColor: "text-blue-800",
      labelColor: "text-blue-700"
    },
    {
      title: "Average",
      value: stats?.avg_temp?.toFixed(1),
      unit: "°C",
      description: "Mean temperature",
      gradient: "from-green-50 to-green-100",
      border: "border-green-100",
      textColor: "text-green-800",
      labelColor: "text-green-700"
    },
    {
      title: "Maximum",
      value: stats?.max_temp?.toFixed(1),
      unit: "°C",
      description: "Highest recorded temperature",
      gradient: "from-red-50 to-red-100",
      border: "border-red-100",
      textColor: "text-red-800",
      labelColor: "text-red-700"
    }
  ];

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-gradient-to-br ${card.gradient} p-6 rounded-2xl shadow-sm border ${card.border}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold ${card.labelColor}`}>{card.title}</span>
          </div>
          <div className={`text-3xl font-bold ${card.textColor}`}>
            {card.value}{card.unit}
          </div>
          <div className={`text-sm ${card.labelColor} mt-2 opacity-80`}>
            {card.description}
          </div>
        </div>
      ))}
    </div>
  );
}