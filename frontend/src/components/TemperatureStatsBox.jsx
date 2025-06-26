import React, { useEffect, useState } from "react";
import { ThermometerIcon } from "lucide-react";
import { API_BASE_URL } from '../config';

const TemperatureStatsBox = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch today's temperature statistics from weekly stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get weekly stats data from backend
      const response = await fetch(`${API_BASE_URL}/api/weekly-stats`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data?.dates?.length > 0) {
        // Get the last (today's) values from the arrays
        const lastIdx = data.dates.length - 1;
        setStats({
          min: data.minTemps[lastIdx],
          max: data.maxTemps[lastIdx],
          avg: data.avgTemps[lastIdx]
        });
      } else {
        setStats(null);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setStats(null);
      setLoading(false);
      // Retry after 2 seconds if fetch fails
      setTimeout(fetchStats, 2000);
    }
  };

  useEffect(() => {
    // Delay initial fetch to ensure backend is ready
    const timer = setTimeout(fetchStats, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm h-[400px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Temperature Stats</h3>
        <div className="text-gray-500">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm h-[400px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Temperature Stats</h3>
        <div className="text-red-500">
          <div>Error loading stats</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm h-[400px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Temperature Stats</h3>
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm h-[400px] flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Today's Temperature Stats</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.min.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Min</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.avg.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.max.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Max</div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureStatsBox; 