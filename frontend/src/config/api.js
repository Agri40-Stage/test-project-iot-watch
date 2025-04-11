// API Configuration
export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTHENTICATE: `${API_BASE_URL}/api/authenticate`,
  SENSOR_LATEST: `${API_BASE_URL}/api/sensor/latest`,
  SENSOR_HISTORY: `${API_BASE_URL}/api/sensor/history`,
};

// Keep the default export for backward compatibility
export default API_BASE_URL;

 