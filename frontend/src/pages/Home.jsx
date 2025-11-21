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
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-3xl text-gray-800 dark:text-white">Dashboard Overview</h1>
      <p className='text-gray-600 dark:text-gray-400'>Live summary of the most recent sensor readings and forecasts.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {latestTemp ? (
          <TemperatureCrad 
            time={latestTemp.time} 
            temperature={latestTemp.temperature} 
            trend={latestTemp.trend} 
          />
        ) : (
          <div className="p-6">Loading Temperature...</div>
        )}
        {latestHumidity ? (
          <HumidityCard 
            time={latestHumidity.time} 
            humidity={latestHumidity.humidity} 
          />
        ) : (
          <div className="p-6">Loading Humidity...</div>
        )}
        <ForecastCard />
      </div>
    </div>
  );
}

export default Home;