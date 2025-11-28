import React from 'react';
import { WiHumidity } from 'react-icons/wi';
import { Link } from 'react-router-dom';

const HumidityCard = ({ time, humidity }) => {
  const formattedHumidity = humidity && !isNaN(humidity) ? parseFloat(humidity).toFixed(1) : 'N/A';
  const lastUpdated = time ? new Date(time).toLocaleTimeString() : '...';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg text-gray-600 dark:text-gray-300">Current Humidity</h2>
          <WiHumidity className="text-blue-500" size={32} />
        </div>
        <p className="text-5xl font-bold text-gray-800 dark:text-white my-4">
          {formattedHumidity}<span className="text-2xl">%</span>
        </p>
      </div>
      <div className="flex justify-between items-end text-sm text-gray-500 dark:text-gray-400">
        <span>Last updated: {lastUpdated}</span>
        <Link to="/humidity" className="font-semibold text-green-600 hover:underline">
          View More &rarr;
        </Link>
      </div>
    </div>
  );
};

export default HumidityCard;