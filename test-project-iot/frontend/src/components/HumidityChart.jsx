import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Filler, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, Filler, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

const HumidityChart = () => {
    const [humidityData, setHumidityData] = useState(null);

    useEffect(() => {
        // fetch("https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&hourly=relative_humidity_2m")
        fetch("https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&daily=relative_humidity_2m_max&timezone=auto")
            .then(response => response.json())
            .then(data => {

                console.log("here is the data structure: " , data.daily.time)

                if (data.daily && data.daily.time && data.daily.relative_humidity_2m_max) { 
                    //this variable give us the 7 past humidity values in the past 7 days
                    const humidity = data.daily.relative_humidity_2m_max.slice(0, 7);
                    //this variable will give us the 7 past days related to the 7 past humidity values 
                    const weekDays = data.daily.time.slice(0,7);
                    console.log(weekDays)

                    setHumidityData({
                        labels: weekDays.map(day => {
                    const date = new Date(day);
                    return date.toLocaleDateString("en-US", { weekday: "long" })
                        }),
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
                    console.error("the data is not fetching properly or mayber undefined:", data);
                }
            })
            .catch(error => console.error("Error fetching humidity data:", error));
    }, []);

    const options = {}; 

    return ( 
        <div className="w-1/2 h-full">
            {humidityData ? <Line options={options} data={humidityData} /> : <p>Loading...</p>}
        </div>
    );
};

export default HumidityChart;
