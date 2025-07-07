import React from "react";
import PropTypes from "prop-types";

/* Icons */
import { ArrowDownIcon, ArrowUpIcon, ThermometerIcon } from "lucide-react";

const TemperatureCrad = ({ time, temperature, trend }) => {
  return (
    <div className="flex flex-col gap-6 max-w-96 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex flex-col gap-2 text-left">
          <h2 className="text-xl font-medium leading-none text-gray-900 dark:text-white">Current Temperature</h2>
          <p className="font-light text-gray-400 dark:text-gray-500 text-base leading-none">Live reading from sensor</p>
        </div>

        <div className="text-sm text-gray-400 dark:text-gray-500 text-nowrap">
          {time}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex items-center">
          <ThermometerIcon className="h-8 w-8 mr-2 text-red-500" />
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {temperature !== null ? temperature : "--"}
          </span>
          <span className="text-2xl font-semibold ml-1 text-gray-900 dark:text-white">°C</span>
        </div>

        {trend !== "stable" && (
          <div className="flex items-center mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {trend === "up" ? (
              <>
                <ArrowUpIcon className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-500">Rising</span>
              </>
            ) : (
              <>
                <ArrowDownIcon className="h-4 w-4 mr-1 text-blue-500" />
                <span className="text-blue-500">Falling</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

TemperatureCrad.PropTypes = {
  time: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
  trend: PropTypes.oneOf(["up","down","stable"]).isRequired,
};

export default TemperatureCrad;
