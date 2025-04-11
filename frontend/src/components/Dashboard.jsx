import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/auth';
import { API_ENDPOINTS } from '../config/api';
import { logout } from '../utils/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [chartDataPoints, setChartDataPoints] = useState(10); // number of data points to show

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch latest sensor data
      const latestResponse = await api.get(API_ENDPOINTS.SENSOR_LATEST);
      setLatestData(latestResponse.data);
      
      // Fetch sensor history
      const historyResponse = await api.get(API_ENDPOINTS.SENSOR_HISTORY);
      setHistoryData(historyResponse.data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to fetch sensor data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    
    // Set up polling to refresh data based on the refreshInterval state
    const intervalId = setInterval(fetchSensorData, refreshInterval * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]); // Re-run effect when refreshInterval changes

  const handleLogout = () => {
    logout();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleRefreshIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setRefreshInterval(newInterval);
  };

  const handleChartDataPointsChange = (e) => {
    const newDataPoints = parseInt(e.target.value);
    setChartDataPoints(newDataPoints);
  };

  // Get the last N readings for the chart based on chartDataPoints state
  const chartData = historyData.slice(-chartDataPoints).map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: reading.temperature
  }));

  // Calculate min and max temperatures for the Y-axis
  const minTemp = Math.min(...chartData.map(d => d.temperature)) - 1;
  const maxTemp = Math.max(...chartData.map(d => d.temperature)) + 1;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Temperature Dashboard</h1>
        <div className="dashboard-controls">
          <div className="control-group">
            <label htmlFor="refreshInterval">Refresh Interval (seconds):</label>
            <select 
              id="refreshInterval" 
              value={refreshInterval} 
              onChange={handleRefreshIntervalChange}
              className="control-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="chartDataPoints">Data Points:</label>
            <select 
              id="chartDataPoints" 
              value={chartDataPoints} 
              onChange={handleChartDataPointsChange}
              className="control-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
      
      {loading && <div className="loading">Loading sensor data...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {latestData && (
        <div className="latest-data">
          <div className="temperature-display">
            <div className="temperature-value">
              <span className="value">{latestData.temperature}°C</span>
              <span className="label">Current Temperature</span>
            </div>
            <div className="temperature-timestamp">
              <span className="label">Last Updated:</span>
              <span className="value">{formatTimestamp(latestData.timestamp)}</span>
            </div>
          </div>
        </div>
      )}
      
      {chartData.length > 0 && (
        <div className="chart-container">
          <h2>Temperature History (Last {chartDataPoints} Readings)</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[minTemp, maxTemp]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  name="Temperature (°C)"
                  stroke="#646cff" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {historyData.length > 0 && (
        <div className="history-data">
          <h2>Recent Readings</h2>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Temperature (°C)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyData.slice(-5).reverse().map((reading, index) => (
                  <tr key={index}>
                    <td>{reading.temperature}°C</td>
                    <td>{formatTimestamp(reading.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 