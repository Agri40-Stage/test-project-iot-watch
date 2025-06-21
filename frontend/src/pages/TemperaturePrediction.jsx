import Header from '../components/Header';
import React, { useEffect, useState } from 'react';

export default function TemperaturePrediction() {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const latitude = 30.42;
    const longitude = -9.6;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=auto`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const days = data.daily.time;
        const temps = data.daily.temperature_2m_max;
        const combined = days.map((date, i) => ({
          date,
          temperature: temps[i]
        }));
        setForecast(combined);
      });
  }, []);

  return (
      <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
        <div className="p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">
            7-Day Temperature Forecast
        </h1>

        <ul className="space-y-2 w-full max-w-md">
            {forecast.map((entry,i) => (
            <li
                key={i}
                className="flex justify-between items-center p-3 bg-white rounded shadow border text-base"
            >
                <span>{entry.date}</span>
                <span className="font-bold">{entry.temperature}°C</span>
            </li>
            ))}
        </ul>
        </div>

    </div>
  );
}
