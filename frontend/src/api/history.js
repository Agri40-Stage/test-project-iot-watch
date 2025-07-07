const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/history`
    );

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // Extract the relevant data from the backend response
      const lastTimestamps = data.lastTimestamps;
      const lastTemperatures = data.lastTemperatures;

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
