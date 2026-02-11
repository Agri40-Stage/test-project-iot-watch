const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/history`
    );

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // Extract the relevant data from the response
      const lastTimestamps = data.timestamps || [];
      const lastTemperatures = data.temperatures || [];

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
