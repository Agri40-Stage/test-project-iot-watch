import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function ChartSection({ stats }) {
  const chartData = {
    labels: ["Min", "Average", "Max"],
    datasets: [
      {
        label: "Temperature (°C)",
        data: stats ? [
          parseFloat(stats.min_temp).toFixed(1), 
          parseFloat(stats.avg_temp).toFixed(1), 
          parseFloat(stats.max_temp).toFixed(1)
        ] : [0, 0, 0],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointBackgroundColor: ["rgb(34, 197, 94)", "rgb(59, 130, 246)", "rgb(239, 68, 68)"],
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}°C`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 12 },
          callback: function(value) {
            return value + '°C';
          }
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 14, weight: 'bold' }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 13, weight: '600' } }
      }
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Temperature Distribution
          </h2>
          <p className="text-gray-600">
            Comparison of minimum, average, and maximum temperatures
          </p>
        </div>
        
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Min: {stats?.min_temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Avg: {stats?.avg_temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Max: {stats?.max_temp?.toFixed(1)}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}