export const login = async (email, password) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("authEmail", data.email);
  return data;
};

export const register = async (email, password, fullName) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password, fullName })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Registration failed");
  }

  const data = await response.json();
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("authEmail", data.email);
  return data;
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authEmail");
};

export const getToken = () => localStorage.getItem("authToken");
