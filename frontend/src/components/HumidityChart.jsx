import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";
import { useAuth } from "../context/AuthContext";
import { fetchHumidityDaily } from "../api/humidity";

// Helper function to get the initial dark mode state (checks localStorage and system preference)
const getInitialDark = () => {
  if (localStorage.getItem("theme")) {
    return localStorage.getItem("theme") === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const HumidityChart = ({ className = "" }) => {
    // State for chart data and dark mode
    const [humidityData, setHumidityData] = useState(null);
    const [isDark, setIsDark] = useState(getInitialDark());
    const [error, setError] = useState(null);
    const { token, isAuthenticated } = useAuth();

    // Listen for changes to the body's class (dark mode toggle)
    useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        fetchHumidityDaily(token)
            .then((data) => {
                if (data.days?.length) {
                    setHumidityData({
                        labels: data.days.map((day) => {
                            const date = new Date(day);
                            return date.toLocaleDateString("en-US", { weekday: "short" });
                        }),
                        datasets: [
                            {
                                label: "Avg humidity",
                                data: data.avg,
                                borderColor: "#36A2EB",
                                backgroundColor: "rgba(54, 162, 235, 0.2)",
                                fill: true,
                                borderWidth: 2,
                                tension: 0.4,
                            },
                        ],
                    });
                } else {
                    setError("No humidity data available yet.");
                }
            })
            .catch((err) => {
                console.error("Error fetching humidity data:", err);
                setError(err.message);
            });
    }, [token, isAuthenticated]);

    // Added options for the chart so that the colors adapt to dark or light mode
    const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        },
      },
      y: {
        grid: {
          color: isDark ? "#333" : "#d1d5db",
        },
        ticks: {
          color: isDark ? "#f1f5f9" : "#374151",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#f1f5f9" : "#1f2937",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#23272a" : "#fff",
        titleColor: isDark ? "#f1f5f9" : "#1f2937",
        bodyColor: isDark ? "#f1f5f9" : "#1f2937",
        borderColor: isDark ? "#444" : "#e5e7eb",
      },
    },
  };

    const containerClasses = `flex justify-center items-center min-h-[200px] w-full ${className}`;

    if (!isAuthenticated) {
        return (
            <div className={containerClasses}>
                <p className="text-gray-500">Authenticate to load humidity analytics.</p>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className="w-full h-full">
                {humidityData && !error ? (
                    <Line options={options} data={humidityData} />
                ) : (
                    <p className="text-gray-500">{error || "Loading..."}</p>
                )}
            </div>
        </div>
    );
};

export default HumidityChart;

HumidityChart.propTypes = {
    className: PropTypes.string,
};
