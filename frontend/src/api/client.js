import { API_BASE_URL } from "../config";

export async function apiRequest(path, { method = "GET", token, body, headers = {} } = {}) {
  const init = {
    method,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  if (token) {
    init.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || response.statusText);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

