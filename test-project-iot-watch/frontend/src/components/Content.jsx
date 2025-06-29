/**
 * Content Component - Main Dashboard
 * =================================
 * 
 * This is the main dashboard component that displays real-time temperature data
 * and historical charts. It manages the state for temperature readings and
 * coordinates data fetching from the backend API.
 * 
 * Features:
 * - Real-time temperature display with trend indicators
 * - Historical temperature chart with Chart.js
 * - Auto-refresh functionality every 10 seconds
 * - Error handling for API requests
 * - Responsive layout with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';

/* Component Imports */
import TemperatureCrad from "../components/TemperatureCrad";    // Temperature display card
import TemperatureChart from "../components/TemperatureChart";  // Historical chart
import Header from "../components/Header";                      // Navigation header

/* API Service Imports */
import fetchLatestTemperature from "../api/latest";    // Latest temperature API
import fetchTemperatureHistory from "../api/history";  // Historical data API

const Content = () => {
  // State for storing the latest temperature data
  const [latestTemperatureTime, setLatestTemperatureTime] = useState(null);
  const [latestTemperature, setLatestTemperature] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  // State for storing the temperature history data for charting
  const [chartData, setChartData] = useState({
    labels: [],  // Timestamps for x-axis
    datasets: [
      {
        label: "Temperature Data",
        data: [],  // Temperature values for y-axis
        fill: false,
        borderColor: "#ff811f",  // Orange color for temperature line
        tension: 0.1  // Smooth line curves
      }
    ]
  });

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };

  /**
   * Fetch the latest temperature data from the backend API
   * 
   * This function calls the latest temperature endpoint and updates
   * the component state with the current temperature, timestamp, and trend.
   */
  const getLatestTemperature = async () => {
    try {
      const data = await fetchLatestTemperature();

      // Update state with the latest temperature data
      setLatestTemperatureTime(data.time);
      setLatestTemperature(data.temperature);
      setTemperatureTrend(data.trend);
    } catch (error) {
      console.error("Error getting latest temperature: ", error);
    }
  }

  /**
   * Fetch the temperature history for the last 10 hours
   * 
   * This function retrieves historical temperature data and formats it
   * for display in the Chart.js component. The data is used to show
   * temperature trends over time.
   */
  const getTemperatureHistory = async () => {
    try {
      const data = await fetchTemperatureHistory();

      console.log('Content: Received history data:', data);

      // Update chart data with historical temperature readings
      const newChartData = {
        labels: data.lastTimestamps,  // X-axis: timestamps
        datasets: [
          {
            label: "Temperature Data",
            data: data.lastTemperatures,  // Y-axis: temperature values
            fill: false,
            borderColor: "#ff811f",  // Orange line color
            tension: 0.1,  // Smooth line curves
          },
        ],
      };

      console.log('Content: Setting chart data:', newChartData);
      setChartData(newChartData);
    } catch (error) {
      console.error("Error getting temperature history: ", error);
    }
  }

  /**
   * useEffect hook for initial data loading and auto-refresh
   * 
   * This effect runs when the component mounts and sets up:
   * 1. Initial data fetch for both latest and historical data
   * 2. Auto-refresh interval that updates data every 10 seconds
   * 3. Cleanup function to clear the interval when component unmounts
   */
  useEffect(() => {
    // Load initial data when component mounts
    getLatestTemperature();
    getTemperatureHistory();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      getLatestTemperature();
      getTemperatureHistory();
    }, 10000);  // 10 seconds interval

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);  // Empty dependency array means this runs only on mount

  return (
    // Main dashboard container with responsive layout
    <div className="flex flex-col gap-8 py-12 px-6">
      {/* Dashboard header with title and description */}
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl">
          Temperature Dashboard
        </h1>
        <p className="text-sm font-light text-gray-400">
          Monitor real-time temperature data and historical trends
        </p>
      </div>

      {/* Main content grid: Temperature card on left, chart on right */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        {/* Temperature display card with current reading and trend */}
        <TemperatureCrad
          time={latestTemperatureTime}
          temperature={latestTemperature}
          trend={temperatureTrend}
        />

        {/* Historical temperature chart */}
        <TemperatureChart
          chartData={chartData}
          chartOptions={chartOptions}
        />
      </div>
    </div>
  )
}

export default Content;
