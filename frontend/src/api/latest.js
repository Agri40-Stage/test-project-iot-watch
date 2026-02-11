const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/latest`
    );

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // Extract the relevant data from the response
      const time = data.time;
      const temperature = data.temperature;
      const trend = data.trend || "stable";

      return { time, temperature, trend };
    }
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
  }
};

export default fetchLatestTemperature;