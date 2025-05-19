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
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-full">
        <p>Loading weekly statistics...</p>
      </div>
    );
  }

  if (error || !weeklyData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-2">{error || "No data available"}</p>
        <details className="text-xs text-gray-500 mt-2 p-2 border rounded">
          <summary>Debug Information</summary>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </details>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        backgroundColor: 'rgba(255, 129, 31, 0.5)',
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Min',
        data: weeklyData.minTemps,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Max',
        data: weeklyData.maxTemps,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    stacked: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Weekly Temperature Statistics',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Weekly Temperature Stats</h2>
        <p className="text-sm text-gray-500">Last 7 days of temperature data</p>
      </div>
      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyStats; 