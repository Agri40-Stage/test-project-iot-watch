import React, { useState, useEffect } from 'react';

/* Components */
import TemperatureCrad from "../components/TemperatureCrad";
import TemperatureChart from "../components/TemperatureChart";

/* API */
import fetchLatestTemperature from "../api/latest";
import fetchTemperatureHistory from "../api/history";

const Content = () => {
  // states to store the latest temperature data
  const [latestTemperatureTime, setLatestTemperatureTime] = useState(null);
  const [latestTemperature, setLatestTemperature] = useState(null);
  const [temperatureTrend, setTemperatureTrend] = useState(null);

  // state to store the temperature history data
  const [temperatureData, setTemperatureData] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature Data",
        data: [],
        fill: false,
        borderColor: "#ff811f",
        tension: 0.1
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  // --- FONCTIONS DE FETCH CORRIGÉES ---

const getLatestTemperature = async () => {
    try {
      const data = await fetchLatestTemperature();
      console.log("Étape 1 - Données brutes reçues :", data); 

      if (data) {
        // Vérifions si les clés existent vraiment
        console.log("Étape 2 - Température extraite :", data.temperature);
        console.log("Étape 2 - Temps extrait :", data.time);

        setLatestTemperatureTime(data.time || data.timestamp);
        setLatestTemperature(data.temperature || data.value);
        setTemperatureTrend(data.trend);
      } else {
        console.warn("Étape 1 bis - L'API a répondu mais la donnée est vide.");
      }
    } catch (error) {
      console.error("Étape 0 - L'appel API a totalement échoué :", error);
    }
  };

const getTemperatureHistory = async () => {
  try {
    const data = await fetchTemperatureHistory();
    console.log("Données reçues dans Content :", data);

    if (data && data.lastTimestamps) {
      setTemperatureData(prev => ({
        ...prev,
        labels: data.lastTimestamps.map(t => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
        datasets: [{
          ...prev.datasets[0],
          data: data.lastTemperatures,
        }]
      }));
    }
  } catch (error) {
    console.error("Erreur graphique :", error);
  }
};



  // --- CYCLE DE VIE ---

  useEffect(() => {
    getLatestTemperature();
    getTemperatureHistory();

    const interval = setInterval(() => {
      getLatestTemperature();
      getTemperatureHistory();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 py-12 px-6">
      <div className="w-full flex flex-col gap-2 text-left">
        <h1 className="font-bold text-3xl dark:text-white">
          Temperature Dashboard
        </h1>
        <p className="text-sm font-light text-gray-400">
          Monitor real-time temperature data and historical trends
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[384px_1fr]">
        <TemperatureCrad
          time={latestTemperatureTime}
          temperature={latestTemperature}
          trend={temperatureTrend}
        />

        <TemperatureChart
          chartData={temperatureData}
          chartOptions={temperatureData.options}
        />
      </div>
    </div>
  );
};

export default Content;