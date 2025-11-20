import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginCard = () => {
  const { login, loading, error, isAuthenticated, logout } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    try {
      await login(form);
      setSuccessMessage("Authenticated successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <h3 className="text-xl font-semibold text-gray-800">Session active</h3>
        </div>
        <p className="text-sm text-gray-500">
          Your JWT token is cached locally. Use the dashboard to explore telemetry.
        </p>
        <button
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">Secure Login</h3>
        <p className="text-sm text-gray-500">
          Use the credentials from your <code>.env</code> file to get a JWT.
        </p>
      </div>

      <label className="text-sm text-gray-600">
        Username
        <input
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="iot-admin"
          required
        />
      </label>

      <label className="text-sm text-gray-600">
        Password
        <input
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••"
          required
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="rememberMe"
          checked={form.rememberMe}
          onChange={handleChange}
          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
        />
        Remember me for 7 days
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginCard;

