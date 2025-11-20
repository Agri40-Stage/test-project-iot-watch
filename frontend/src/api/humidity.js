import { apiRequest } from "./client";

export const fetchHumidityDaily = (token) =>
  apiRequest("/api/humidity/daily", { token });

