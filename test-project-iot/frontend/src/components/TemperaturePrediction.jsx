import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { API_BASE_URL } from '../config';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TemperaturePrediction = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [predictionDay, setPredictionDay] = useState(1);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      console.log(`Fetching predictions from: ${API_BASE_URL}/api/predict?day=${predictionDay}`);
      setDebugInfo(`Attempting to fetch from: ${API_BASE_URL}/api/predict?day=${predictionDay}`);
      
      const response = await fetch(`${API_BASE_URL}/api/predict?day=${predictionDay}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Prediction data received:", data);
      
      if (data.error) {
        setError(data.error);
        setPredictionData(null);
        setDebugInfo(prev => prev + `\nError from API: ${data.error}`);
      } else {
        setPredictionData(data);
        setError(null);
        setDebugInfo(prev => prev + "\nData received successfully");
      }
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(`Failed to load temperature predictions: ${err.message}`);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
      
      // Try to initialize the database or insert mock data if the backend is running but lacks data
      if (err.message.includes("Not enough historical data")) {
        try {
          setDebugInfo(prev => prev + "\nAttempting to insert mock data...");
          const mockDataResponse = await fetch(`${API_BASE_URL}/api/insert-mock-data`, {
            method: 'POST'
          });
          
          if (mockDataResponse.ok) {
            setDebugInfo(prev => prev + "\nMock data inserted successfully. Retrying prediction...");
            
            // Wait a moment for the database to be updated
            setTimeout(() => {
              setDebugInfo(prev => prev + "\nRetrying prediction fetch...");
              fetchPredictions();
            }, 1000);
          } else {
            setDebugInfo(prev => prev + "\nFailed to insert mock data");
          }
        } catch (mockErr) {
          setDebugInfo(prev => prev + `\nError inserting mock data: ${mockErr.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    
    // Refresh predictions every 30 minutes
    const interval = setInterval(() => {
      fetchPredictions();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [predictionDay]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.getHours()}:00`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  let chartData = null;
  if (!loading && !error && predictionData) {
    const formattedLabels = predictionData.timestamps.map(formatDate);

    chartData = {
      labels: formattedLabels,
      datasets: [
        {
          label: `Day ${predictionData.day} Predictions`,
          data: predictionData.predictions,
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
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Predicted: ${context.parsed.y}°C`;
          },
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return new Date(predictionData?.timestamps[index]).toLocaleString();
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
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
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
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Temperature Prediction</h2>
          <p className="text-sm font-medium text-gray-500">5-Day Hourly Temperature Forecast</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="daySelect" className="text-sm font-medium text-gray-600">Day to predict:</label>
          <select 
            id="daySelect"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            value={predictionDay}
            onChange={(e) => setPredictionDay(parseInt(e.target.value))}
          >
            <option value="1">Tomorrow</option>
            <option value="2">Day after tomorrow</option>
            <option value="3">In 3 days</option>
            <option value="4">In 4 days</option>
            <option value="5">In 5 days</option>
          </select>
        </div>
      </div>
      
      {error || !predictionData ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <div className="text-red-500 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error || "No prediction data available"}
          </div>
          <details className="text-xs text-gray-500 mt-2 p-2 border rounded bg-gray-50">
            <summary className="cursor-pointer hover:text-gray-700">Debug Information</summary>
            <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 shadow-sm"
            onClick={fetchPredictions}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="h-[300px]">
          <Line options={options} data={chartData} />
        </div>
      )}
    </div>
  );
};

export default TemperaturePrediction; 