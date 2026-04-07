const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/history`);
    if (response.ok) {
      const data = await response.json();
      return {
        lastTimestamps: data.lastTimestamps,
        lastTemperatures: data.lastTemperatures
      };
    }
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    throw error;
  }
};

export default fetchTemperatureHistory;