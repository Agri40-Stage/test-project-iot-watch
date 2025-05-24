import React from "react";
import PropTypes from "prop-types";

/* Chart Js */
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);
import { Line } from "react-chartjs-2";

const TemperatureChart = ({ chartData, chartOptions }) => {
  const enhancedOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Temperature: ${context.parsed.y}°C`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return value + '°C';
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const enhancedData = {
    ...chartData,
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      backgroundColor: 'rgba(255, 129, 31, 0.1)',
      borderColor: '#ff811f',
      pointBackgroundColor: '#ff811f',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }))
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full flex flex-col gap-2 text-left">
        <h2 className="text-xl font-semibold text-gray-800">
          Temperature History
        </h2>
        <p className="font-medium text-gray-500 text-sm">
          Last 10 temperature readings
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <Line
          data={enhancedData}
          options={enhancedOptions}
          className="min-h-[300px] w-full"
        />
      </div>
    </div>
  );
};

TemperatureChart.propTypes = {
  chartData: PropTypes.object,
  chartOptions: PropTypes.object,
};

export default TemperatureChart;
