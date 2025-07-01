import { API_BASE_URL } from "../config";

const fetchTemperatureHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // The backend now provides the exact data needed for the chart.
    // We just format the timestamps for better readability.
    const formattedLabels = data.lastTimestamps.map((ts) =>
      new Date(ts).toLocaleTimeString()
    );

    return {
      lastTimestamps: formattedLabels,
      lastTemperatures: data.lastTemperatures,
    };
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    // Return a default state on error
    return {
      lastTimestamps: [],
      lastTemperatures: [],
    };
  }
};

export default fetchTemperatureHistory;
  