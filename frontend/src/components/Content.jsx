import React, { useState, useEffect } from "react";

/* Components */
import TemperatureCard from "../components/TemperatureCard";
import TemperatureChart from "../components/TemperatureChart";

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
        tension: 0.1,
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // Function to fetch the latest temperature from our backend
  const getLatestTemperature = async () => {
    try {
      const data = await fetchLatestTemperature();
      setLatestTemperatureTime(data.time);
      setLatestTemperature(data.temperature);
      setTemperatureTrend(data.trend);
    } catch (error) {
      console.error("Error getting latest temperature: ", error);
    }
  };

  // Function to fetch the temperature history from our backend
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
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    getLatestTemperature();
    getTemperatureHistory();

    const interval = setInterval(() => {
      getLatestTemperature();
      getTemperatureHistory();
    }, 5000); // Poll our backend more frequently for a near-real-time feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl">Temperature Dashboard</h1>
        <p className="text-sm font-light text-gray-400">
          Monitor real-time temperature data and historical trends from our own
          backend service.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <TemperatureCard
          time={latestTemperatureTime}
          temperature={latestTemperature}
          trend={temperatureTrend}
        />

        <TemperatureChart
          chartData={temperatureData}
          chartOptions={temperatureData.options}
        />
      </div>
    </div>
  );
};

export default Content;
