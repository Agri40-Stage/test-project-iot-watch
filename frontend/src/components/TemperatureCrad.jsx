import React from "react";
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';

import { ArrowDown, ArrowUp, Thermometer } from "lucide-react";

const TemperatureCrad = ({ time, temperature, trend }) => {
  
  const formattedTemperature = temperature && !isNaN(temperature) ? parseFloat(temperature).toFixed(1) : "N/A";
  const lastUpdated = time ? new Date(time).toLocaleTimeString() : "...";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg text-gray-600 dark:text-gray-300">Current Temperature</h2>
          <Thermometer className="text-red-500" size={32} />
        </div>
        
        <div className="flex items-baseline gap-2 my-4">
            <p className="text-5xl font-bold text-gray-800 dark:text-white">
                {formattedTemperature}
            </p>
            <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">°C</span>
        </div>

        {trend && trend !== "stable" && (
          <div className="flex items-center text-sm font-medium">
            {trend === "up" ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-500">Rising</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-blue-500">Falling</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-end text-sm text-gray-500 dark:text-gray-400 mt-4">
        <span>Last updated: {lastUpdated}</span>
        <Link to="/temperature" className="font-semibold text-green-600 hover:underline">
          View More &rarr;
        </Link>
      </div>
    </div>
  );
};

TemperatureCrad.propTypes = {
  time: PropTypes.string,
  temperature: PropTypes.number,
  trend: PropTypes.oneOf(["up", "down", "stable"]),
};

export default TemperatureCrad;