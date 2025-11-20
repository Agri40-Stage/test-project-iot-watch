import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("iot-token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ username, password, rememberMe = false }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { username, password, rememberMe },
      });
      setToken(response.accessToken);
      localStorage.setItem("iot-token", response.accessToken);
      return response;
    } catch (err) {
      setError(err.message || "Unable to login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("iot-token");
  };

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      loading,
      error,
      isAuthenticated: Boolean(token),
    }),
    [token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

