const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // Format timestamps for the chart
    data.lastTimestamps = data.lastTimestamps.map(t => new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    return data;
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    return { lastTimestamps: [], lastTemperatures: [] };
  }
};

export default fetchTemperatureHistory;