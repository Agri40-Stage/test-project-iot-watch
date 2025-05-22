import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

const HumidityChart = () => {
    const [humidityData, setHumidityData] = useState(null);

    useEffect(() => {
        fetch("https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&hourly=relative_humidity_2m")
            .then(response => response.json())
            .then(data => {

                if (data.hourly && data.hourly.relative_humidity_2m) { 
                    const humidity = data.hourly.relative_humidity_2m.slice(0, 7);
                    const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

                    setHumidityData({
                        labels: labels,
                        datasets: [{
                            label: "Humidity Agadir",
                            data: humidity,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            fill: true,
                            borderWidth: 2,
                            tension: 0.4,
                        }]
                    });
                } else {
                    console.error("Humidity data is missing or undefined:", data);
                }
            })
            .catch(error => console.error("Error fetching humidity data:", error));
    }, []);

    const options = {}; 

    return ( 
        <div className="w-1/2 h-1/2">
            {humidityData ? <Line options={options} data={humidityData} /> : <p>Loading...</p>}
        </div>
    );
};

export default HumidityChart;
