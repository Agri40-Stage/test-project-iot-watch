const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&current_weather=true&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.current_weather) {
      throw new Error('Invalid API response: missing current_weather data');
    }

    const time = data.current_weather.time;
    const temperature = data.current_weather.temperature;

    // Use in-memory storage instead of localStorage
    const latestTemperature = window.previousTemperature || temperature;
    
    let trend = "stable";
    if (temperature > latestTemperature) {
      trend = "up";
    } else if (temperature < latestTemperature) {
      trend = "down";
    }

    window.previousTemperature = temperature;

    return { time, temperature, trend };
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
    throw error; // ✅ CRITICAL: Propagate error to Content.js
  }
};

export default fetchLatestTemperature;