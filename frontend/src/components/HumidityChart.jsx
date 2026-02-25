import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);

const getInitialDark = () => {
  if (localStorage.getItem("theme")) {
    return localStorage.getItem("theme") === "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const HumidityChart = () => {
    const [humidityData, setHumidityData] = useState(null);
    const [currentHumidity, setCurrentHumidity] = useState(null);
    const [insight, setInsight] = useState("");
    const [isDark, setIsDark] = useState(getInitialDark());

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.body.classList.contains('dark'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        fetch("https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&current=relative_humidity_2m&daily=relative_humidity_2m_max&timezone=auto&past_days=7")
            .then(response => response.json())
            .then(data => {
                if (data.daily && data.daily.time && data.daily.relative_humidity_2m_max) { 
                    
                    const humidity = data.daily.relative_humidity_2m_max.slice(0, 7);
                    const weekDays = data.daily.time.slice(0,7);

                    setHumidityData({
                        labels: weekDays.map(day => {
                            const date = new Date(day);
                            return date.toLocaleDateString("en-US", { weekday: "long" });
                        }),
                        datasets: [{
                            label: "Max Humidity (%)",
                            data: humidity,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            fill: true,
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: "#36A2EB",
                        }]
                    });

                    if(data.current && data.current.relative_humidity_2m) {
                        const current = data.current.relative_humidity_2m;
                        setCurrentHumidity(current);

                        if (current > 80) {
                            setInsight("High Risk: Elevated humidity detected. High risk of fungal diseases in crops. Ensure proper greenhouse ventilation.");
                        } else if (current < 40) {
                            setInsight("Low Humidity: High water evaporation rate. Consider increasing irrigation for sensitive crops today.");
                        } else {
                            setInsight("Optimal Conditions: Humidity is within a normal, healthy range for most agricultural activities.");
                        }
                    }
                } else {
                    alert("The data is not fetching properly or may be undefined:\n" );
                }
            })
            .catch(error => console.error("Error fetching humidity data:", error));
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { color: isDark ? "#333" : "#e5e7eb" },
                ticks: { color: isDark ? "#f1f5f9" : "#374151" },
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: isDark ? "#333" : "#e5e7eb" },
                ticks: { color: isDark ? "#f1f5f9" : "#374151" },
            },
        },
        plugins: {
            legend: { labels: { color: isDark ? "#f1f5f9" : "#1f2937" } },
            tooltip: {
                backgroundColor: isDark ? "#23272a" : "#fff",
                titleColor: isDark ? "#f1f5f9" : "#1f2937",
                bodyColor: isDark ? "#f1f5f9" : "#1f2937",
                borderColor: isDark ? "#444" : "#e5e7eb",
                borderWidth: 1
            },
        },
    };

    return ( 
        <div className={`p-6 max-w-6xl mx-auto ${isDark ? 'text-white' : 'text-gray-800'}`}>
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Humidity Dashboard</h1>
                <p className="text-sm opacity-70">Monitor real-time humidity data and AI agricultural insights for Agadir</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                <div className={`p-6 rounded-xl shadow-md border flex flex-col justify-center items-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className="text-lg font-semibold mb-2 opacity-80">Current Humidity</h2>
                    <div className="text-5xl font-bold text-blue-500 flex items-baseline">
                        {currentHumidity !== null ? currentHumidity : "--"} <span className="text-2xl ml-1">%</span>
                    </div>
                </div>

                <div className={`p-6 rounded-xl shadow-md border md:col-span-2 flex flex-col justify-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h2 className="text-lg font-semibold mb-3 flex items-center">
                        <span className="mr-2 text-2xl">🤖</span> Agri-Smart Insight
                    </h2>
                    <p className={`text-lg font-medium ${insight.includes('Risk') ? 'text-red-500' : insight.includes('Low') ? 'text-yellow-600' : 'text-green-500'}`}>
                        {insight || "Analyzing current weather data..."}
                    </p>
                </div>

            </div>

            <div className={`p-6 rounded-xl shadow-md border w-full h-96 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h2 className="text-lg font-semibold mb-4 text-center">7-Day Humidity History</h2>
                <div className="h-full w-full pb-8">
                    {humidityData ? <Line options={options} data={humidityData} /> : <div className="flex justify-center items-center h-full"><p>Loading chart data...</p></div>}
                </div>
            </div>
            
        </div>
    );
};

export default HumidityChart;