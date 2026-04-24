const fetchTemperatureHistory = async () => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&forecast_days=1&timezone=auto&hourly=temperature_2m`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Error fetching history:", response.statusText);
      return { lastTimestamps: [], lastTemperatures: [] };
    }

    const data = await response.json();
    const timestamps = data.hourly.time;
    const temperatures = data.hourly.temperature_2m;

    // On prend les 10 dernières heures à partir de "maintenant"
    const now = new Date();
    const startIndex = timestamps.findIndex((t) => new Date(t) >= now) - 10;
    
    // Sécurité : on s'assure que startIndex n'est pas négatif
    const actualStart = startIndex < 0 ? 0 : startIndex;

    const lastTimestamps = timestamps.slice(actualStart, actualStart + 10);
    const lastTemperatures = temperatures.slice(actualStart, actualStart + 10);

    return { lastTimestamps, lastTemperatures };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { lastTimestamps: [], lastTemperatures: [] };
  }
};

export default fetchTemperatureHistory;