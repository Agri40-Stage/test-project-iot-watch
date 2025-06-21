import React from "react";
import PropTypes from "prop-types";

/* Icons */
import { ArrowDownIcon, ArrowUpIcon, ThermometerIcon } from "lucide-react";

// returns true if temp is in [-10, 50]
function isNormalTemperature(temp) {
  return temp >= -10 && temp <= 50;
}

const TemperatureCrad = ({ time, temperature, trend }) => {
  const normal = isNormalTemperature(temperature);
  return (
    <div className="flex flex-col gap-6 max-w-96 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex flex-col gap-2 text-left">
          <h2 className="text-xl font-medium leading-none">Current Temperature</h2>
          <p className="font-light text-gray-400 text-base leading-none">Live reading from sensor</p>
        </div>
        <div className="text-sm text-gray-400 text-nowrap">{time}</div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="flex items-center">
          <ThermometerIcon className="h-8 w-8 mr-2 text-red-500" />
          <span className="text-5xl font-bold">
            {temperature !== null ? temperature : "--"}
          </span>
          <span className="text-2xl font-semibold ml-1">°C</span>
        </div>
        {trend !== "stable" && (
          <div className="flex items-center mt-2 text-sm font-medium">
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
              {!normal && (
          <div className="mt-2 text-red-600 font-semibold">
            ⚠️ Not normal! Temperature is out of safe range.
          </div>
        )}
              {normal && (
          <div className="mt-2 text-green-600 font-semibold">
            Normal Temperature 
          </div>
        )}
    </div>
  );
};

TemperatureCrad.propTypes = {
  time: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
  trend: PropTypes.oneOf(["up", "down", "stable"]).isRequired,
};

export default TemperatureCrad;
