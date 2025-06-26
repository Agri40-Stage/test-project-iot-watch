import { API_BASE_URL } from '../config';

const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/latest`);
    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();
      // Return all relevant fields including latitude and longitude
      return {
        time: data.time,
        temperature: data.temperature,
        trend: data.trend,
        latitude: data.latitude,
        longitude: data.longitude
      };
    }
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
  }
};

export default fetchLatestTemperature;