import React, { useState, useEffect } from 'react';

/* Components */
import TemperatureCrad from "./TemperatureCrad";
import TemperatureChart from "./TemperatureChart";
import WeeklyStats from "./WeeklyStats";
import TemperaturePrediction from "./TemperaturePrediction";

/* API */
import fetchLatestTemperature from "../api/latest";
import fetchTemperatureHistory from "../api/history";

const Content = () => {
  // states to store the latest temperature data
  const [latestTemperatureTime, setLatestTemperatureTime] = useState(null);
  const [latestTemperature, setLatestTemperature] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  // state to store the temperature history data
  const [temperatureData, setTemperatureData] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature Data",
        data: [],
        fill: false,
        borderColor: "#ff811f",
        tension: 0.1
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  // Function to fetch the latest temperature
  const getLatestTemperature = async () => {
    try {
      const data = await fetchLatestTemperature();

      setLatestTemperatureTime(data.time);
      setLatestTemperature(data.temperature);
      setTemperatureTrend(data.trend);
    } catch (error) {
      console.error("Error getting latest temperature: ", error);
    }
  }

  // Function to fetch the temperature history for the last 10 hours
  const getTemperatureHistory = async () => {
    try {
      const data = await fetchTemperatureHistory();

      setTemperatureData({
        labels: data.lastTimestamps,
        datasets: [
          {
            label: "Temperature Data",
            data: data.lastTemperatures,
            fill: false,
            borderColor: "#ff811f",
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error("Error getting temperature history: ", error);
    }
  }

  // Auto-refresh every 10 seconds
  useEffect(() => {
    getLatestTemperature();
    getTemperatureHistory();

    const interval = setInterval(() => {
      getLatestTemperature();
      getTemperatureHistory();
    }, 10000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex flex-col gap-8 p-8 w-full h-full">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-4xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Temperature Dashboard
        </h1>
        <p className="text-base font-medium text-gray-600">
          Monitor real-time temperature data and historical trends
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[384px_1fr] w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full">
          <TemperatureCrad
            time={latestTemperatureTime}
            temperature={latestTemperature}
            trend={temperatureTrend}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full">
          <TemperatureChart
            chartData={temperatureData}
            chartOptions={temperatureData.options}
          />
        </div>
      </div>
      
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full">
          <WeeklyStats />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full">
          <TemperaturePrediction />
        </div>
      </div>
    </div>
  )
}

export default Content;
