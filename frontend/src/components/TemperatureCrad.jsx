import React from "react";
import PropTypes from "prop-types";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DropletIcon,
  ThermometerIcon,
  ActivityIcon,
} from "lucide-react";

const TrendBadge = ({ trend }) => {
  if (trend === "stable") {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
        <ActivityIcon className="h-3 w-3 mr-1" />
        Stable
      </span>
    );
  }

  const isUp = trend === "up";
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
        isUp ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
      }`}
    >
      {isUp ? (
        <ArrowUpIcon className="h-3 w-3 mr-1" />
      ) : (
        <ArrowDownIcon className="h-3 w-3 mr-1" />
      )}
      {isUp ? "Rising" : "Falling"}
    </span>
  );
};

const TemperatureCard = ({
  time,
  temperature,
  humidity,
  trend,
  currentHourAvg,
  readingsThisHour,
}) => {
  return (
    <div className="flex flex-col gap-5 max-w-96 py-8 px-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="w-full flex flex-col text-left">
          <h2 className="text-xl font-semibold leading-none text-gray-900">
            Current Temperature
          </h2>
          <p className="font-light text-gray-400 text-sm leading-tight">
            Live reading from the Open-Meteo sensor feed
          </p>
        </div>
        <TrendBadge trend={trend || "stable"} />
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="flex items-center">
          <ThermometerIcon className="h-8 w-8 mr-2 text-orange-500" />
          <span className="text-5xl font-bold text-gray-900">
            {temperature !== null && temperature !== undefined ? temperature.toFixed(1) : "--"}
          </span>
          <span className="text-2xl font-semibold ml-1 text-gray-500">°C</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Last updated: {time || "—"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-xl bg-orange-50">
          <p className="text-xs uppercase tracking-wide text-orange-500 mb-1">
            Avg this hour
          </p>
          <p className="text-base font-semibold text-gray-900">
            {currentHourAvg ? `${currentHourAvg.toFixed(1)} °C` : "Collecting"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50">
          <p className="text-xs uppercase tracking-wide text-blue-500 mb-1 flex items-center">
            <DropletIcon className="h-3 w-3 mr-1" />
            Humidity
          </p>
          <p className="text-base font-semibold text-gray-900">
            {humidity !== null && humidity !== undefined ? `${humidity.toFixed(1)} %` : "—"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 col-span-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Readings this hour
          </span>
          <span className="text-base font-semibold text-gray-900">
            {readingsThisHour ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

TemperatureCard.propTypes = {
  time: PropTypes.string,
  temperature: PropTypes.number,
  humidity: PropTypes.number,
  trend: PropTypes.oneOf(["up", "down", "stable"]),
  currentHourAvg: PropTypes.number,
  readingsThisHour: PropTypes.number,
};

TrendBadge.propTypes = {
  trend: PropTypes.oneOf(["up", "down", "stable"]).isRequired,
};

export default TemperatureCard;
