const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/latest`);
    if (response.ok) {
      const data = await response.json();
      return {
        time: data.time,
        temperature: data.temperature,
        trend: data.trend
      };
    }
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
  }
};

export default fetchLatestTemperature;