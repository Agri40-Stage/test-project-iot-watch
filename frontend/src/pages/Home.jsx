import React, { useState, useEffect } from 'react';
import TemperatureCrad from '../components/TemperatureCrad';
import HumidityCard from '../components/HumidityCard';
import ForecastCard from '../components/ForecastCard';
import fetchLatestTemperature from '../api/latest';
import { fetchLatestHumidity } from '../api/humidity';

function Home() {
  const [latestTemp, setLatestTemp] = useState(null);
  const [latestHumidity, setLatestHumidity] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [tempData, humidityData] = await Promise.all([
        fetchLatestTemperature(),
        fetchLatestHumidity(),
      ]);
      setLatestTemp(tempData);
      setLatestHumidity(humidityData);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Temp Watch Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Monitoring temperature and humidity with a minimalist IoT dashboard built for fast insights.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {latestTemp ? (
          <TemperatureCrad time={latestTemp.time} temperature={latestTemp.temperature} trend={latestTemp.trend} />
        ) : (
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm text-[var(--text-primary)]">Loading temperature...</div>
        )}
        {latestHumidity ? (
          <HumidityCard time={latestHumidity.time} humidity={latestHumidity.humidity} />
        ) : (
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm text-[var(--text-primary)]">Loading humidity...</div>
        )}
        <ForecastCard />
      </div>
    </div>
  );
}

export default Home;
