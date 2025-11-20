import { apiRequest } from "./client";

export const fetchAiInsights = (token) =>
  apiRequest("/api/ai/insights", { token });

