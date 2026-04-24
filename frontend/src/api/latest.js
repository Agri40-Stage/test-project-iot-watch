const fetchLatestTemperature = async () => {
  try {
    // Remplacement de l'URL pour être sûr que ça pointe vers Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=30.4202&longitude=-9.5982&current_weather=true&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
      return null;
    }

    const data = await response.json();
    const time = data.current_weather.time;
    const temperature = data.current_weather.temperature;

    const previousTemp = localStorage.getItem("latestTemperature") || temperature;
    let trend = temperature > previousTemp ? "up" : temperature < previousTemp ? "down" : "stable";

    localStorage.setItem("latestTemperature", temperature);

    return { time, temperature, trend };
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
    return null;
  }
};

export default fetchLatestTemperature;