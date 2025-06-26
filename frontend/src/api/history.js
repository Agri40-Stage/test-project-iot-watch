import { API_BASE_URL } from '../config';

const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();
      // Use the correct keys from backend response
      return {
        lastTimestamps: data.lastTimestamps,
        lastTemperatures: data.lastTemperatures,
      };
    }
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    throw error;
  }
};

export default fetchTemperatureHistory;
