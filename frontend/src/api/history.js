const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&forecast_days=1&timezone=auto&hourly=temperature_2m`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
      throw new Error('Invalid API response: missing hourly data');
    }

    const timestamps = data.hourly.time;
    const temperatures = data.hourly.temperature_2m;

    // Calculate the last 10 hours
    const startTime = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
    const startIndex = timestamps.findIndex((timestamp) => new Date(timestamp) >= new Date(startTime));

    if (startIndex === -1) {
      throw new Error('No recent temperature data available');
    }

    const lastTimestamps = timestamps.slice(startIndex, startIndex + 10);
    const lastTemperatures = temperatures.slice(startIndex, startIndex + 10);

    return {
      lastTimestamps,
      lastTemperatures,
    };
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    throw error; // ✅ CRITICAL: Propagate error to Content.js
  }
};

export default fetchTemperatureHistory;
