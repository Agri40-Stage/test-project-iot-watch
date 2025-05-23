import React from "react";
import PropTypes from "prop-types";

/* Chart Js */
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
import { Line } from "react-chartjs-2";

const TemperatureChart = ({ chartData, chartOptions }) => {
  return (
    <div className="flex flex-col gap-6 lg:col-span-1 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
      <div className="w-full flex flex-col gap-2 rtext-left">
        <h2 className="text-xl font-medium leading-none">
          Temperature History
        </h2>
        <p className="font-light text-gray-400 text-base leading-none">
          Last 10 temperature readings
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <Line
          data={chartData}
          options={chartOptions}
          className="min-h-[300px]"
        />
      </div>
    </div>
  );
};

TemperatureChart.PropTypes = {
  chartData: PropTypes.object,
  chartOptions: PropTypes.array,
};

export default TemperatureChart;
