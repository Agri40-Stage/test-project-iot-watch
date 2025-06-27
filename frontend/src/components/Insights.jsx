// src/components/Insights.jsx
import React, { useEffect, useState } from "react";
import { fetchInsights } from "../api/insights";

export default function Insights() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // wrap everything in an async so we can catch
    (async () => {
      try {
        const json = await fetchInsights();
        console.log("✅ insights response:", json);
        
        if (!json.success) {
          throw new Error(json.error || json.message || "Unknown error");
        }
        
        // Check if insights data exists and has the right structure
        if (!json.insights) {
          throw new Error("No insights data in response");
        }
        
        if (!json.insights.summary || !Array.isArray(json.insights.highlights)) {
          console.warn("⚠️ Unexpected insights structure:", json.insights);
          throw new Error("Invalid insights data structure");
        }
        
        setData(json);
      } catch (err) {
        console.error("❌ fetchInsights error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 text-blue-700 rounded">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          Loading AI insights…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h3 className="font-semibold mb-2">Error loading insights</h3>
        <p className="text-sm">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check the correct nested structure
  if (!data || !data.insights || !Array.isArray(data.insights.highlights)) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
        <h3 className="font-semibold mb-2">No insights available yet</h3>
        <p className="text-sm">
          {data ? 
            `Unexpected data structure: ${JSON.stringify(data, null, 2)}` : 
            "Waiting for AI analysis..."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="mr-2">🤖</span>
        AI Weather Insights
      </h3>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-gray-700">{data.insights.summary}</p>
      </div>
      
      <div>
        <h4 className="font-medium mb-2 text-gray-800">Key Highlights:</h4>
        <ul className="list-disc list-inside space-y-2">
          {data.insights.highlights.map((highlight, i) => (
            <li key={i} className="text-gray-700 pl-2">
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Debug info - remove this once working */}
      <details className="mt-4 text-xs text-gray-500">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}