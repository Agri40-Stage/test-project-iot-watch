/**
 * Temperature History API Client
 * ==============================
 * 
 * This module provides a function to fetch historical temperature data
 * from the Flask backend API. It retrieves the last 10 temperature readings
 * from our database and formats it for chart display.
 * 
 * The function fetches historical data from our backend which stores
 * temperature readings from the Open-Meteo API in a SQLite database.
 * 
 * Features:
 * - Historical temperature data from Flask backend
 * - Database-stored temperature readings
 * - Chart-ready data formatting
 * - Error handling and logging
 */

const fetchTemperatureHistory = async () => {
  try {
    // Make API request to our Flask backend using relative URL
    // The Vite proxy will forward this to http://localhost:5000
    const response = await fetch(
      `/api/history?latitude=30.4202&longitude=-9.5982`
    );

    console.log('History API Response Status:', response.status);

    if (!response.ok) {
      console.error("Error fetching temperature history:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();
      
      console.log('History API Response Data:', data);
      console.log('Timestamps:', data.lastTimestamps);
      console.log('Temperatures:', data.lastTemperatures);

      // The backend already provides the last 10 readings in the correct format
      return {
        lastTimestamps: data.lastTimestamps,    // X-axis data for the chart
        lastTemperatures: data.lastTemperatures,  // Y-axis data for the chart
      };
    }
  } catch (error) {
    console.error("Error fetching temperature history:", error);
    throw error;  // Re-throw error for handling in calling component
  }
};

export default fetchTemperatureHistory;
