import React, { useEffect, useState } from "react";
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

const TemperatureChart = () => {
  const [isDark, setIsDark] = useState(getInitialDark());
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Temperature',
      data: [],
      borderColor: '#ff811f',
      backgroundColor: 'rgba(255, 129, 31, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ff811f',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  });

  // Listen for changes to the body's class (dark mode toggle)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch temperature history
  useEffect(() => {
    const fetchTemperatureHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/temperature/history`);
        if (response.ok) {
          const data = await response.json();
          const temperatures = data.map(item => item.temperature);
          const timestamps = data.map(item => new Date(item.timestamp).toLocaleTimeString());
          
          setChartData(prevData => ({
            ...prevData,
            labels: timestamps,
            datasets: [{
              ...prevData.datasets[0],
              data: temperatures
            }]
          }));
        }
      } catch (error) {
        console.error('Error fetching temperature history:', error);
      }
    };

    fetchTemperatureHistory();
    const interval = setInterval(fetchTemperatureHistory, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        }
      },
      y: {
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: isDark ? "#f1f5f9" : "#374151",
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? "#f1f5f9" : "#1f2937",
        }
      },
      tooltip: {
        backgroundColor: isDark ? "#23272a" : "#fff",
        titleColor: isDark ? "#f1f5f9" : "#1f2937",
        bodyColor: isDark ? "#f1f5f9" : "#1f2937",
        borderColor: isDark ? "#444" : "#e5e7eb",
        callbacks: {
          label: function(context) {
            return `Temperature: ${context.parsed.y}°C`;
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:col-span-1 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
      <div className="w-full flex flex-col gap-2 text-left">
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

export default TemperatureChart;