import { apiRequest } from "./client";

const fetchLatestTemperature = async (token) => {
  const data = await apiRequest("/api/latest", { token });
  return data;
};

export default fetchLatestTemperature;