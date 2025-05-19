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
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-full">
        <p>Loading predictions...</p>
      </div>
    );
  }

  // Prepare chart data
  let chartData = null;
  if (!loading && !error && predictionData) {
    // Format timestamps for display using the custom formatter
    const formattedLabels = predictionData.timestamps.map(formatDate);

    // Prepare chart data
    chartData = {
      labels: formattedLabels,
      datasets: [
        {
          label: `Day ${predictionData.day} Predictions`,
          data: predictionData.predictions,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          tension: 0.3,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Day ${predictionDay} Hourly Temperature Prediction`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return new Date(predictionData?.timestamps[index]).toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Temperature Prediction</h2>
          <p className="text-sm text-gray-500">5-Day Hourly Temperature Forecast</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="daySelect" className="text-sm">Day to predict:</label>
          <select 
            id="daySelect"
            className="border rounded p-1 text-sm"
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
          <p className="text-red-500 mb-2">{error || "No prediction data available"}</p>
          <details className="text-xs text-gray-500 mt-2 p-2 border rounded">
            <summary>Debug Information</summary>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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