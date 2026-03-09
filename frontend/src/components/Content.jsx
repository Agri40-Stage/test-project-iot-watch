import React, { useState, useEffect } from 'react';

/* Components */
import TemperatureCrad from "../components/TemperatureCrad";
import TemperatureChart from "../components/TemperatureChart";
import Header from "../components/Header";
import PredictionChart from "./PredictionChart";
import TemperaturePrediction from "./TemperaturePrediction";

/* API */
import fetchLatestTemperature from "../api/latest";
import fetchTemperatureHistory from "../api/history";

const Content = () => {
  // states to store the latest temperature data
  const [latestTemperatureTime, setLatestTemperatureTime] = useState(null);
  const [latestTemperature, setLatestTemperature] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

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
      if (data.status === "High"){
        setMessage(data.message);
        setStatus("high");
      }
      else if (data.status === "Low"){
        setMessage(data.message);
        setStatus("low");
      }
      else {
        setMessage(data.message);
        setStatus("normal");
      }

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
      const result = detectAnomaly(data.lastTemperatures);
      setStatus(result.status);
      setMessage(result.message);
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
    }, 10000);//10000 milliseconds = 10 seconds

    return () => clearInterval(interval);
  }, []);
const detectAnomaly = (temperature) => {
  const mean =  temperature.reduce((sum,val) => sum + val,0)/ temperature.length;
  const variance = temperature.reduce((sum,val) => sum + Math.pow(val -mean,2),0)/ temperature.length;
  const std = Math.sqrt(variance);
  const latest =  temperature[temperature.length -1];
  const zScore = (latest -mean)/std;

  if (zScore > 2) {
    return {
      status: "High",
      message: "High Temperature detected !"
    }
  }else if (zScore < -2) {
    return {
      status: "Low",
      message: "Low Temperature detected !"
    }
  }else {
    return {
      status: "Normal",
      message: "Temperature level is normal."
    }
  }
};

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
{message && (
            <div
              className={`text-center p-3 rounded mb-4 font-semibold shadow-mb
                ${status === "High" ? "bg-red-100 text-red-500 border-red-400" : ""}
                ${status === "Low" ? "bg-yellow-100 text-yellow-500 border-yellow-400" : ""}
                ${status === "Normal" ? "bg-green-100 text-green-500 border-green-400" : ""}
              `}
            >
              {message}
            </div>
          )}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <TemperatureCrad
          time={latestTemperatureTime}
          temperature={latestTemperature}
          trend={temperatureTrend}
        />
        
        <TemperatureChart
          chartData={temperatureData}
          chartOptions={temperatureData.options}
        />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <TemperaturePrediction />
        </div>
    </div>
  )
}

export default Content;
