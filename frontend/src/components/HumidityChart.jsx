import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";
import { getHumidityHistory } from "../api/humidity";

// Helper function to get the initial dark mode state (checks localStorage and system preference)
const getInitialDark = () => {
  if (localStorage.getItem("theme")) {
    return localStorage.getItem("theme") === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const HumidityChart = () => {
    // State for chart data and dark mode
    const [humidityData, setHumidityData] = useState(null);
    const [isDark, setIsDark] = useState(getInitialDark());

    // Listen for changes to the body's class (dark mode toggle)
    useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

    useEffect(() => {
        const fetchHumidityData = async () => {
            try {
                const response = await getHumidityHistory();
                
                if (response.success && response.data && response.data.length > 0) {
                    const humidityValues = response.data.map(item => item.humidity);
                    const dates = response.data.map(item => item.date);
                    
                    console.log("Humidity data from backend:", response.data);
                    
                    setHumidityData({
                        labels: dates.map(date => {
                            const dateObj = new Date(date);
                            return dateObj.toLocaleDateString("en-US", { weekday: "long" });
                        }),
                        datasets: [{
                            label: "Humidity Agadir (Real-time)",
                            data: humidityValues,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            fill: true,
                            borderWidth: 2,
                            tension: 0.4,
                        }]
                    });
                } else {
                    console.error("No humidity data available from backend");
                    // Fallback to external API if no backend data
                    fetch("https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&daily=relative_humidity_2m_max&timezone=auto&past_days=7")
                        .then(response => response.json())
                        .then(data => {
                            if (data.daily && data.daily.time && data.daily.relative_humidity_2m_max) {
                                const humidity = data.daily.relative_humidity_2m_max.slice(0, 7);
                                const weekDays = data.daily.time.slice(0, 7);
                                
                                setHumidityData({
                                    labels: weekDays.map(day => {
                                        const date = new Date(day);
                                        return date.toLocaleDateString("en-US", { weekday: "long" });
                                    }),
                                    datasets: [{
                                        label: "Humidity Agadir (External API)",
                                        data: humidity,
                                        borderColor: "#36A2EB",
                                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                                        fill: true,
                                        borderWidth: 2,
                                        tension: 0.4,
                                    }]
                                });
                            }
                        })
                        .catch(error => console.error("Error fetching fallback humidity data:", error));
                }
            } catch (error) {
                console.error("Error fetching humidity data:", error);
            }
        };
        
        fetchHumidityData();
    }, []);

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

    return ( 
        <div className="flex justify-center items-center min-h-1/2 w-4xl">
            <div className="w-full h-full">
                {humidityData ? <Line options={options} data={humidityData} /> : <p className="text-gray-700 dark:text-gray-300">Loading...</p>}
            </div>
        </div>
    );
};

export default HumidityChart;
