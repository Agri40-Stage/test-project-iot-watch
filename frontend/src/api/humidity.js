
import { API_BASE_URL } from '../config';

export const fetchHumidityHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/humidity/history`);
    if (!response.ok) {
      throw new Error('Network response was not ok for humidity history');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching humidity history:", error);
    return { timestamps: [], humidities: [] };
  }
};

export const fetchLatestHumidity = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/humidity/latest`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching latest humidity:", error);
    return { time: "N/A", humidity: "N/A" };
  }
};