
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchHumidityHistory } from "../api/humidity";

ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement, Title);

const getInitialDark = () => {
  if (localStorage.getItem("theme")) {
    return localStorage.getItem("theme") === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const HumidityChart = () => {
    const [humidityData, setHumidityData] = useState(null);
    const [isDark, setIsDark] = useState(getInitialDark());

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.body.classList.contains('dark'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const loadChartData = async () => {
            try {
                const data = await fetchHumidityHistory();

                if (data && data.timestamps && data.humidities) { 
                    setHumidityData({
                        labels: data.timestamps.map(day => {
                            const date = new Date(day);
                            return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                        }),
                        datasets: [{
                            label: "Real-Time Humidity (%)",
                            data: data.humidities,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            fill: true,
                            borderWidth: 2,
                            tension: 0.4,
                        }]
                    });
                } else {
                    console.error("Humidity data from the backend is not in the expected format.");
                }
            } catch (error) {
                console.error("Error setting up humidity chart data:", error);
            }
        };

        loadChartData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                position: 'top',
                labels: {
                    color: isDark ? "#f1f5f9" : "#1f2937",
                },
            },
            title: {
                display: true,
                text: 'Last 20 Humidity Readings',
                color: isDark ? "#f1f5f9" : "#1f2937",
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
        <div className="flex justify-center items-center h-96 w-full max-w-4xl">
            <div className="w-full h-full">
                {humidityData ? <Line options={options} data={humidityData} /> : <p>Loading Humidity Chart...</p>}
            </div>
        </div>
    );
};

export default HumidityChart;