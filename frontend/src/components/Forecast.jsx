import React from 'react';
import TemperaturePrediction from '../components/TemperaturePrediction';

function Forecast() {
  return (
    <div className="flex flex-col gap-8">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl text-gray-800 dark:text-white">5-Day Forecast</h1>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Hourly temperature predictions for the upcoming days, based on the latest forecast data.
        </p>
      </div>
      <TemperaturePrediction />
    </div>
  );
}

export default Forecast;