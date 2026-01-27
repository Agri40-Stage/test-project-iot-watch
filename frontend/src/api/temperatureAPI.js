// api/temperatureAPI.js

// API calls for temperature data
const API_BASE_URL = 'http://localhost:5000/api';

export const temperatureAPI = {
  // Existing endpoints
  getLatest: () => fetch(`${API_BASE_URL}/latest`).then(res => res.json()),
  getHistory: () => fetch(`${API_BASE_URL}/history`).then(res => res.json()),
  getWeeklyStats: () => fetch(`${API_BASE_URL}/weekly-stats`).then(res => res.json()),
  getPredictions: (day) => fetch(`${API_BASE_URL}/predict?day=${day}`).then(res => res.json()),
  getForecast: () => fetch(`${API_BASE_URL}/forecast`).then(res => res.json()),
  
  // Detailed statistics
  getDetailedStats: (latitude, longitude) => {
    let url = `${API_BASE_URL}/stats/detailed`;
    if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
    }
    return fetch(url).then(res => res.json());
  },
  
  // NEW: Temperature statistics with range parameter
  getStats: (range = "day") => {
    return fetch(`${API_BASE_URL}/stats?range=${range}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error("Error fetching temperature stats:", error);
        throw error;
      });
  }
};