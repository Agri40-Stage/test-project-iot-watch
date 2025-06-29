/**
 * Latest Temperature API Client
 * =============================
 * 
 * This module provides a function to fetch the latest temperature data
 * from the Flask backend API. It handles the API request, processes
 * the response, and displays temperature trends.
 * 
 * The function fetches current temperature data from our backend which
 * aggregates data from the Open-Meteo API and provides additional
 * features like trend analysis and database storage.
 * 
 * Features:
 * - Real-time temperature data from Flask backend
 * - Temperature trend analysis
 * - Error handling and logging
 */

const fetchLatestTemperature = async () => {
  try {
    // Make API request to our Flask backend using relative URL
    // The Vite proxy will forward this to http://localhost:5000
    const response = await fetch(
      `/api/latest?latitude=30.4202&longitude=-9.5982`
    );

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // The backend already provides processed data including trend
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