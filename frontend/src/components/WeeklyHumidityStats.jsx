import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const WeeklyHumidityStats = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/humidity/weekly-stats`);
        if (!response.ok) throw new Error("Network response failed");
        const data = await response.json();
        setWeeklyData(data);
      } catch (err) {
        console.error("Error fetching weekly humidity stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
    const interval = setInterval(fetchWeeklyStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weeklyData) {
    return <div className="p-6">Loading weekly humidity statistics...</div>;
  }

  const chartData = {
    labels: weeklyData.dates,
    datasets: [
      { type: 'line', label: 'Average', data: weeklyData.avgHumidities, borderColor: '#36A2EB', yAxisID: 'y' },
      { type: 'bar', label: 'Min', data: weeklyData.minHumidities, backgroundColor: 'rgba(54, 162, 235, 0.5)', yAxisID: 'y' },
      { type: 'bar', label: 'Max', data: weeklyData.maxHumidities, backgroundColor: 'rgba(0, 100, 150, 0.5)', yAxisID: 'y' },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { title: { display: true, text: 'Humidity (%)' } } }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Weekly Humidity Stats</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last 7 days of humidity data</p>
      </div>
      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyHumidityStats;