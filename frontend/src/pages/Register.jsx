import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Carte centrée et responsive */}
      <div className="w-full max-w-sm">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          
          {/* Header compact */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                  IoT Temp Watch
                </p>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Create account
                </h2>
              </div>
              <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm border border-white/30">
                °C
              </div>
            </div>
          </div>

          {/* Formulaire compact */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Champ email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Champ password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              {/* Champ confirm password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm password"
                  required
                />
              </div>

              {/* Message d'erreur compact */}
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  ⚠️ {error}
                </div>
              )}

              {/* Bouton compact */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm py-2.5 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-70 shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-4 text-xs text-center">
              <button
                className="text-blue-600 hover:text-purple-600 font-medium"
                onClick={() => navigate("/login")}
              >
                Already have an account? Sign in
              </button>
            </div>

            {/* Footer compact */}
            <p className="mt-4 text-[10px] text-center text-gray-400 border-t border-gray-100 pt-3">
              🔒 Secure connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
