import React, { useState, useEffect } from 'react';
import HumidityCard from "./HumidityCard";
import HumidityChart from "./HumidityChart";
import { fetchLatestHumidity } from "../api/humidity";
import { fetchHumidityHistory } from "../api/humidity";

const HumidityContent = () => {
  const [latestHumidityData, setLatestHumidityData] = useState({ time: null, humidity: null });
  const [historyChartData, setHistoryChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [latestData, historyData] = await Promise.all([
        fetchLatestHumidity(),
        fetchHumidityHistory()
      ]);

      setLatestHumidityData(latestData);

      if (historyData) {
        setHistoryChartData({
          labels: historyData.timestamps.map(t => new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })),
          datasets: [{
            label: "Minute-Average Humidity (%)",
            data: historyData.humidities,
            fill: true,
            borderColor: "#36A2EB",
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
          }],
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl dark:text-white">Humidity Dashboard</h1>
        <p className="text-sm font-light text-gray-400">Monitor real-time humidity data and historical trends</p>
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <HumidityCard
          time={latestHumidityData.time}
          humidity={latestHumidityData.humidity}
        />
        {historyChartData ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-[400px]">
            <HumidityChart data={historyChartData} />
          </div>
        ) : (
          <div>Loading Chart...</div>
        )}
      </div>
    </div>
  );
};

export default HumidityContent;