import { apiRequest } from "./client";

const fetchTemperatureHistory = async (token) => {
  const data = await apiRequest("/api/history", { token });
  return data;
};

export default fetchTemperatureHistory;
