import React, { useState, useEffect } from 'react';
import TemperatureCrad from "./TemperatureCrad";
import TemperatureChart from "./TemperatureChart";
import fetchLatestTemperature from "../api/latest";
import fetchTemperatureHistory from "../api/history";

const Content = () => {
  const [latestTempData, setLatestTempData] = useState({ time: null, temperature: null, trend: null });
  const [historyChartData, setHistoryChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both sets of data concurrently
      const [latestData, historyData] = await Promise.all([
        fetchLatestTemperature(),
        fetchTemperatureHistory()
      ]);

      setLatestTempData(latestData);

      if (historyData) {
        setHistoryChartData({
          labels: historyData.lastTimestamps,
          datasets: [{
            label: "Real-Time Temperature (°C)",
            data: historyData.lastTemperatures,
            fill: true,
            borderColor: "#ff811f",
            backgroundColor: "rgba(255, 129, 31, 0.1)",
            tension: 0.4,
          }],
        });
      }
    };

    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col gap-8 py-12 px-6">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl">Temperature Dashboard</h1>
        <p className="text-sm font-light text-gray-400">Monitor real-time temperature data and historical trends</p>
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <TemperatureCrad
          time={latestTempData.time}
          temperature={latestTempData.temperature}
          trend={latestTempData.trend}
        />
        {historyChartData ? (
          <TemperatureChart chartData={historyChartData} />
        ) : (
          <div>Loading Chart...</div>
        )}
      </div>
    </div>
  );
};

export default Content;