import { API_URL, API_BASE_URL } from '../config';

const fetchTemperatureHistory = async () => {
  try {
    // First try to fetch from our Flask backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Could not fetch from local API, falling back to remote API:", error);
    }
    
    // Fallback to the original API
    const response = await fetch(
      `${API_URL}?latitude=30.4202&longitude=-9.5982&forecast_days=1&timezone=auto&hourly=temperature_2m`
    );

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // Extract the relevant data from the response
      const timestamps = data.hourly.time;
      const temperatures = data.hourly.temperature_2m;

      // Calculate the last 10 hours
      const startTime = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();

      // Find the index of the timestamp that is equal or greater than (approximately equal) the start time
      const startIndex = timestamps.findIndex((timestamp) => new Date(timestamp) >= new Date(startTime));

      // Slice only the last 10 hours of data to be returned and dispalyed in the chart
      const lastTimestamps = timestamps.slice(startIndex, startIndex + 10);
      const lastTemperatures = temperatures.slice(startIndex, startIndex + 10);

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
