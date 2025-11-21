import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp } from 'react-icons/fi';

const ForecastCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-lg text-gray-600 dark:text-gray-300">Weather Forecast</h2>
          <FiTrendingUp className="text-purple-500" size={32} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 my-4">
          View detailed hourly temperature predictions for the next 5 days.
        </p>
      </div>
      <Link 
        to="/forecast" 
        className="font-semibold text-green-600 hover:underline text-right mt-4"
      >
        View Forecast &rarr;
      </Link>
    </div>
  );
};

export default ForecastCard;