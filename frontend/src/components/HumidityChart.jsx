import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

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
        fetch("http://localhost:5000/api/weekly-stats")
            .then(response => response.json())
            .then(data => {
                if (data.dates && data.avgTemps) {
                    setHumidityData({
                        labels: data.dates.map(day => {
                            const date = new Date(day);
                            return date.toLocaleDateString("en-US", { weekday: "long" });
                        }),
                        datasets: [{
                            label: "Avg Temperature Agadir (°C)",
                            data: data.avgTemps,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            fill: true,
                            borderWidth: 2,
                            tension: 0.4,
                        }]
                    });
                } else {
                    alert("The data is not fetching properly or may be undefined:");
                }
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    const options = {
        responsive: true,
        scales: {
            x: {
                grid: { color: isDark ? "#333" : "#d1d5db" },
                ticks: { color: isDark ? "#f1f5f9" : "#374151" },
            },
            y: {
                grid: { color: isDark ? "#333" : "#d1d5db" },
                ticks: { color: isDark ? "#f1f5f9" : "#374151" },
            },
        },
        plugins: {
            legend: {
                labels: { color: isDark ? "#f1f5f9" : "#1f2937" },
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
                {humidityData ? <Line options={options} data={humidityData} /> : <p>Loading...</p>}
            </div>
        </div>
    );
};

export default HumidityChart;