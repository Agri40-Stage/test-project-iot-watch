import React from "react";

/* Chart Js */
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

/*data to practice with the chart */
import lineChart from "../../data/data"


const HumidityChart = ()=>{
    const options = {};
    const data =lineChart;
return(
    <div className="w-1/2 h-1/2">
    <Line options={options} data={data} />


    </div>

)
}

export default HumidityChart;