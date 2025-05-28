import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

// Helper to get initial dark mode state (matches your app logic)
const getInitialDark = () => {
  if (localStorage.getItem("theme")) {
    return localStorage.getItem("theme") === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const TemperatureChart = ({ chartData, chartOptions }) => {
  // Use getInitialDark to have the correct initial state on refresh (and it updates instantly on toggle)
  const [isDark, setIsDark] = useState(getInitialDark());

  // Listen for changes to the body's class (dark mode toggle)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Added options for the chart so the colors can adapt to light or dark mode
  const options = {
    ...chartOptions,
    scales: {
      x: {
        ...chartOptions?.scales?.x,
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        },
      },
      y: {
        ...chartOptions?.scales?.y,
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        },
      },
    },
    plugins: {
      ...chartOptions?.plugins,
      legend: {
        ...chartOptions?.plugins?.legend,
        labels: {
          color: isDark ? "#f1f5f9" : "#1f2937",
        },
      },
      tooltip: {
        ...chartOptions?.plugins?.tooltip,
        backgroundColor: isDark ? "#23272a" : "#fff",
        titleColor: isDark ? "#f1f5f9" : "#1f2937",
        bodyColor: isDark ? "#f1f5f9" : "#1f2937",
        borderColor: isDark ? "#444" : "#e5e7eb",
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 lg:col-span-1 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
      <div className="w-full flex flex-col gap-2 rtext-left">
        <h2 className="text-xl font-medium leading-none">
          Temperature History
        </h2>
        <p className="font-light text-gray-400 text-base leading-none">
          Last 10 temperature readings
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-6">
        <Line
          data={chartData}
          options={options}
          className="min-h-[300px]"
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