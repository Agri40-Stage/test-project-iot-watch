import React, { useEffect, useState } from "react";
import { temperatureAPI } from '../../api/temperatureAPI';
import RangeSelector from './RangeSelector';
import StatsCards from './StatsCards';
import ChartSection from './ChartSection';
import InsightsSection from './InsightsSection';
import LoadingSpinner from './LoadingSpinner';

export default function TemperatureStats() {
  const [range, setRange] = useState("day");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadStats(range);
  }, [range]);

  const loadStats = async (timeRange) => {
    setLoading(true);
    try {
      const data = await temperatureAPI.getStats(timeRange);
      setStats(data);
      setCount(data.count || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          📊 Temperature Statistics
        </h1>
        <p className="text-gray-600">
          Analysis based on {count} readings over {range === 'hour' ? 'the last hour' : 
          range === 'day' ? '24 hours' : '7 days'}
        </p>
      </div>

      <RangeSelector range={range} setRange={setRange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatsCards stats={stats} />
        <ChartSection stats={stats} />
      </div>

      <InsightsSection stats={stats} range={range} count={count} />
    </div>
  );
}