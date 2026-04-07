const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function fetchAnomalies(limit = 100) {
  const response = await fetch(`${API_BASE_URL}/api/anomalies?limit=${limit}`);
  const data = await response.json();
  return data;
}