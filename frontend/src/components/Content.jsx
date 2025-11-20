import React, { useState, useEffect } from 'react';
import TemperatureCard from "./TemperatureCrad";
import TemperatureChart from "./TemperatureChart";
import fetchLatestTemperature from "../api/latest";
import fetchTemperatureHistory from "../api/history";
import { useAuth } from "../context/AuthContext";

const buildChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
});

const Content = () => {
  const { token, isAuthenticated } = useAuth();
  const [latestReading, setLatestReading] = useState(null);
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
    options: buildChartOptions(),
  });
  const [error, setError] = useState(null);

  const loadLatest = async () => {
    try {
      const data = await fetchLatestTemperature(token);
      setLatestReading(data);
      setError(null);
    } catch (err) {
      console.error("Error getting latest temperature: ", err);
      setError(err.message);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await fetchTemperatureHistory(token);
      setTemperatureData((prev) => ({
        ...prev,
        labels: data.lastTimestamps,
        datasets: [
          {
            ...prev.datasets[0],
            data: data.lastTemperatures,
          },
        ],
      }));
      setError(null);
    } catch (err) {
      console.error("Error getting temperature history: ", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    loadLatest();
    loadHistory();

    const interval = setInterval(() => {
      loadLatest();
      loadHistory();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 py-12 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
        <h1 className="font-bold text-3xl">Temperature Dashboard</h1>
        <p className="text-sm text-gray-500">
          Sign in to stream live sensor data and unlock charting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-12 px-6">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl">
          Temperature Dashboard
        </h1>
        <p className="text-sm font-light text-gray-400">
          Monitor real-time temperature data and historical trends
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <TemperatureCard
          time={latestReading?.time}
          temperature={latestReading?.temperature ?? null}
          humidity={latestReading?.humidity ?? null}
          trend={latestReading?.trend || "stable"}
          currentHourAvg={latestReading?.current_hour_avg}
          readingsThisHour={latestReading?.readings_this_hour}
        />

        <TemperatureChart
          chartData={temperatureData}
          chartOptions={temperatureData.options}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
          {error}
        </div>
      )}
    </div>
  )
}

export default Content;
