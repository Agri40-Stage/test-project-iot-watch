import React, { useEffect, useState } from "react";
import { fetchAiInsights } from "../api/ai";
import { useAuth } from "../context/AuthContext";

const AiInsightsCard = () => {
  const { token, isAuthenticated } = useAuth();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInsight = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAiInsights(token);
      setInsight(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInsight();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
        <p className="text-sm text-gray-500">
          Sign in to let the LLM summarize recent readings and advise next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
          <p className="text-xs text-gray-500">powered by OpenAI or rule-based fallback</p>
        </div>
        <button
          onClick={loadInsight}
          disabled={loading}
          className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Generating insight...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {insight && (
        <>
          <p className="text-sm text-gray-800">{insight.insight}</p>
          <div className="text-xs text-gray-500 flex flex-col gap-1">
            <span>Source: {insight.source}</span>
            <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
          </div>
          {insight.highlights && (
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-800">{insight.highlights.min?.toFixed?.(1) ?? "—"}°C</p>
                <p>Min</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-800">{insight.highlights.avg?.toFixed?.(1) ?? "—"}°C</p>
                <p>Avg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="font-semibold text-gray-800">{insight.highlights.max?.toFixed?.(1) ?? "—"}°C</p>
                <p>Max</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AiInsightsCard;

