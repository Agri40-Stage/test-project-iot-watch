import { API_BASE_URL } from "../config";

const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/latest`);

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // The backend now provides the time, temperature, and trend directly.
    return {
      time: new Date(data.time).toLocaleString(),
      temperature: data.temperature,
      trend: data.trend,
    };
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
    // Return a default state on error to prevent app crash
    return { time: "N/A", temperature: null, trend: "stable" };
  }
};

export default fetchLatestTemperature;
