import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const WeeklyHumidityStats = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
    return <div className="bg-[var(--card-bg)] rounded-2xl p-6 text-[var(--text-secondary)]">Loading weekly humidity statistics...</div>;
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
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          color: isDark ? '#f3f4f6' : '#1f2937'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f3f4f6' : '#1f2937',
        bodyColor: isDark ? '#f3f4f6' : '#1f2937',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: { 
      y: { 
        title: { 
          display: true, 
          text: 'Humidity (%)',
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      x: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      }
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] p-6 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Weekly Humidity Stats</h2>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Last 7 days of humidity data</p>
      </div>
      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyHumidityStats;