import React from "react";
import PropTypes from "prop-types";

/* Icons */
import { ArrowDownIcon, ArrowUpIcon, ThermometerIcon, SunIcon, CloudIcon, AlertTriangleIcon, CheckCircleIcon, SnowflakeIcon } from "lucide-react";

const TemperatureCrad = ({ time, temperature, trend, advice }) => {
  const isHighTemp = temperature > 35;
  const isLowTemp = temperature < 5;
  
  // Determine color and icon based on weather condition
  const getStatusColor = () => {
    if (isHighTemp) return "bg-red-50 text-red-600 border-red-200";
    if (isLowTemp) return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-green-50 text-green-600 border-green-200";
  };
  
  const StatusIcon = () => {
    if (isHighTemp) return <SunIcon className="w-8 h-8 text-orange-500 mb-2" />;
    if (isLowTemp) return <SnowflakeIcon className="w-8 h-8 text-blue-500 mb-2" />;
    return <SunIcon className="w-8 h-8 text-yellow-500 mb-2" />;
  };

  return (
    <div className="flex flex-col gap-6 max-w-96 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="w-full flex flex-col gap-2 text-left">
          <h2 className="text-xl font-medium leading-none">Current Temperature</h2>
          <p className="font-light text-gray-400 text-sm">{time ? new Date(time).toLocaleTimeString() : "Loading..."}</p>
        </div>
        
        <div className="p-2 rounded-full bg-orange-50">
          <StatusIcon />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="flex items-start">
          <span className="text-6xl font-bold tracking-tighter text-gray-800">
            {temperature !== null ? temperature.toFixed(1) : "--"}
          </span>
          <span className="text-3xl font-medium text-gray-500 mt-2 ml-1">°C</span>
        </div>

        {trend && trend !== "stable" && (
          <div className={`flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {trend === "up" ? (
              <>
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                <span>Rising</span>
              </>
            ) : trend === "down" ? (
              <>
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                <span>Falling</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {advice && (
        <div className={`p-4 rounded-lg border flex gap-3 items-start ${getStatusColor()}`}>
          {isHighTemp || isLowTemp ? (
             <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
             <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium leading-relaxed">{advice}</p>
        </div>
      )}
    </div>
  );
};

TemperatureCrad.propTypes = {
  time: PropTypes.string,
  temperature: PropTypes.number,
  trend: PropTypes.string,
  advice: PropTypes.string
};

export default TemperatureCrad;
