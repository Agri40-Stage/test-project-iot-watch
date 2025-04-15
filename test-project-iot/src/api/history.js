const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&forecast_days=1&timezone=auto&hourly=temperature_2m`
    );

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();
      console.log("History: ", data);

      const timestamps = data.hourly.time;
      const temperatures = data.hourly.temperature_2m;

      const startTime = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();

      const startIndex = timestamps.findIndex((timestamp) => new Date(timestamp) >= new Date(startTime));

      const lastTimestamps = timestamps.slice(startIndex, startIndex + 10);
      const lastTemperatures = temperatures.slice(startIndex, startIndex + 10);

      console.log(lastTimestamps, lastTemperatures);

      return {
        lastTimestamps,
        lastTemperatures,
      };
    }
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    throw error;
  }
};

export default fetchTemperatureHistory;
