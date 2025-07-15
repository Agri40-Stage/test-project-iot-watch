import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { API_BASE_URL } from "../config";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);
const PredictedTemperatureChart = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/predict`);
        if (!res.ok) throw new Error("Failed to fetch prediction data");
        const data = await res.json();
        console.log("🔍 Predicted temperature data:", data);
        setPredictionData(data);
        const extreme = data.hourly.find((hour) => hour.temperature >= 40);
        if (extreme) {
          setAlert({
            time: extreme.time,
            temp: extreme.temperature,
          });
        } else {
          setAlert(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/predict?day=1")
      .then((response) => {
        const data = response.data;
        setPredictionData(data);

        // Check for extreme heat
        const extreme = data.hourly.find((hour) => hour.temperature >= 40);
        if (extreme) {
          setAlert({
            time: extreme.time,
            temp: extreme.temperature,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch prediction:", err);
      });
  }, []);
  if (loading) return <div className="p-4">Loading prediction chart...</div>;
  if (error || !predictionData)
    return <div className="p-4 text-red-500">Error: {error}</div>;

  const chartData = {
    labels: predictionData.hourly.map((entry) => entry.time),
    datasets: [
      {
        label: "Predicted Temperature (°C)",
        data: predictionData.hourly.map((entry) => entry.temperature),
        fill: true,
        backgroundColor: "rgba(255,129,31,0.1)",
        borderColor: "#ff811f",
        tension: 0.4,
        pointBackgroundColor: "#ff811f",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}°C`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "#6b7280",
        },
        ticks: {
          color: "#6b7280",
          callback: (val) => `${val}°C`,
        },
        grid: {
          color: "#e5e7eb",
        },
        suggestedMax:
          Math.max(...predictionData.hourly.map((e) => e.temperature)) + 2,
      },
    },
  };

  return (
    <div className="w-full h-full">
      {alert && (
        <div className="bg-red-600 text-white p-4 mb-4 rounded-xl shadow-md animate-pulse">
          <h3 className="text-lg font-bold">🔥 Extreme Heat Alert</h3>
          <p className="text-sm">
            Expected temperature of <strong>{alert.temp.toFixed(1)}°C</strong>{" "}
            at <strong>{alert.time}</strong>. Stay hydrated and avoid going out
            mid-day!
          </p>
        </div>
      )}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          24-Hour Predicted Temperatures
        </h2>
        <p className="text-sm text-gray-500">
          Forecast for {predictionData.date} ({predictionData.day_of_week})
        </p>
      </div>
      <div className="h-[450px] flex justify-center">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PredictedTemperatureChart;
