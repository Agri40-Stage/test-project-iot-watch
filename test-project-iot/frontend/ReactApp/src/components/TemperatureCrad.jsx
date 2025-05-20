import React from "react";
import PropTypes from "prop-types";

/* Icons */
import { ArrowDownIcon, ArrowUpIcon, ThermometerIcon, SunIcon, CloudIcon } from "lucide-react";

const TemperatureCrad = ({ time, temperature, trend }) => {
  // Format temperature to display with two decimal places
  const formattedTemperature = temperature !== null 
    ? temperature.toFixed(2) 
    : "--";

  // Determine weather icon based on temperature
  const getWeatherIcon = (temp) => {
    if (temp === null) return <CloudIcon className="h-12 w-12 text-gray-400" />;
    if (temp > 25) return <SunIcon className="h-12 w-12 text-yellow-500" />;
    return <CloudIcon className="h-12 w-12 text-blue-400" />;
  };

  // Custom thermometer component
  const CustomThermometer = ({ temp }) => {
    const height = temp ? Math.min(Math.max((temp / 40) * 100, 0), 100) : 0;
    
    return (
      <div className="relative w-8 h-24 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full overflow-hidden border border-orange-500 shadow-inner">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Temperature liquid */}
        <div 
          className="absolute bottom-0 w-full bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 transition-all duration-500"
          style={{ height: `${height}%` }}
        >
          {/* Liquid shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Temperature markers */}
        <div className="absolute inset-0 flex flex-col justify-between items-center py-1">
          <div className="text-[8px] font-bold text-gray-500">40°</div>
          <div className="text-[8px] font-bold text-gray-500">30°</div>
          <div className="text-[8px] font-bold text-gray-500">20°</div>
          <div className="text-[8px] font-bold text-gray-500">10°</div>
          <div className="text-[8px] font-bold text-gray-500">0°</div>
        </div>

        {/* Bulb at bottom */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full border border-orange-500 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex flex-col gap-2 text-left">
          <h2 className="text-xl font-semibold text-gray-800">Current Temperature</h2>
          <p className="font-medium text-gray-500 text-sm">Live reading from sensor</p>
        </div>

        <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {time}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <CustomThermometer temp={temperature} />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-baseline">
              <span className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {formattedTemperature}
              </span>
              <span className="text-2xl font-semibold ml-1 text-gray-700">°C</span>
            </div>
            {trend !== "stable" && (
              <div className="flex items-center mt-2 text-sm font-medium">
                {trend === "up" ? (
                  <>
                    <ArrowUpIcon className="h-4 w-4 mr-1 text-red-500" />
                    <span className="text-red-500">Temperature Rising</span>
                  </>
                ) : (
                  <>
                    <ArrowDownIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-blue-500">Temperature Falling</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
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
