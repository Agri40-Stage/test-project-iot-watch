import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyStats = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
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

  const fetchWeeklyStats = async () => {
    try {
      setLoading(true);
      console.log(`Fetching weekly stats from: ${API_BASE_URL}/api/weekly-stats`);
      setDebugInfo(`Attempting to fetch from: ${API_BASE_URL}/api/weekly-stats`);
      
      const response = await fetch(`${API_BASE_URL}/api/weekly-stats`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Weekly stats data received:", data);
      setDebugInfo(prev => prev + "\nData received successfully");
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setWeeklyData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching weekly stats:", err);
      setError(`Failed to load weekly statistics: ${err.message}`);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
      
      // Try to fetch from backup API if available
      try {
        setDebugInfo(prev => prev + "\nAttempting fallback fetch...");
        // Implement fallback logic here if needed
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
        setDebugInfo(prev => prev + `\nFallback also failed: ${fallbackErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyStats();
    
    // Refresh data every minute
    const interval = setInterval(() => {
      fetchWeeklyStats();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] p-6 transition-shadow duration-200 h-full flex items-center justify-center dark:bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)]">Loading weekly statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !weeklyData) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] p-6 transition-shadow duration-200 h-full flex flex-col items-center justify-center dark:bg-[var(--bg-primary)]">
        <div className="text-red-500 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error || "No data available"}
        </div>
        <details className="text-xs text-[var(--text-secondary)] mt-2 p-2 border border-[var(--border)] rounded bg-[var(--bg-secondary)] dark:bg-[var(--card-bg)]">
          <summary className="cursor-pointer hover:text-[var(--text-primary)]">Debug Information</summary>
          <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
        </details>
        <button 
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[rgba(77,184,176,0.9)] transition-colors duration-200 shadow-sm"
          onClick={fetchWeeklyStats}
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: weeklyData.dates,
    datasets: [
      {
        type: 'line',
        label: 'Average',
        data: weeklyData.avgTemps,
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
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Min',
        data: weeklyData.minTemps,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderRadius: 4,
        borderWidth: 0,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Max',
        data: weeklyData.maxTemps,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderRadius: 4,
        borderWidth: 0,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    stacked: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: isDark ? '#f3f4f6' : '#1f2937',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f3f4f6' : '#1f2937',
        bodyColor: isDark ? '#f3f4f6' : '#1f2937',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}°C`;
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
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return value + '°C';
          }
        },
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        }
      }
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] p-6 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Weekly Temperature Stats</h2>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Last 7 days of temperature data</p>
      </div>
      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyStats; 

