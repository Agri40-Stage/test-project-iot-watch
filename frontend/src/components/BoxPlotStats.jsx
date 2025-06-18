import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import Plot from 'react-plotly.js';




const BoxPlotStats = () => {
  const [boxData, setBoxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const fetchBoxPlotData = async () => {
    try {
      setLoading(true)
      console.log(`Fetching weekly stats from: ${API_BASE_URL}/api/boxplot-data`);
      setDebugInfo(`Attempting to fetch from: ${API_BASE_URL}/api/boxplot-data`);

      const res = await fetch(`${API_BASE_URL}/api/boxplot-data`);

      if (!res.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await res.json();

      console.log("Boxplot stats data received:", data);
      setDebugInfo(prev => prev + "\nData received successfully");

      if (data.error) {
        throw new Error(data.error);
      }

      setBoxData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching boxplot stats:", err);
      setError(`Failed to load boxplot statistics: ${err.message}`);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);

      // Try to fetch from backup API if available
      try {
        setDebugInfo(prev => prev + "\nAttempting fallback fetch...");
        // Implement fallback logic here if needed
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
        setDebugInfo(prev => prev + `\nFallback also failed: ${fallbackErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxPlotData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading boxplot statistics...</p>
        </div>
      </div>
    );
  }
  if (error || !boxData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 h-full flex flex-col items-center justify-center">
        <div className="text-red-500 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error || "No data available"}
        </div>
        <details className="text-xs text-gray-500 mt-2 p-2 border rounded bg-gray-50">
          <summary className="cursor-pointer hover:text-gray-700">Debug Information</summary>
          <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
        </details>
        <button
          className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 shadow-sm"
          onClick={fetchBoxPlotData}
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  // Construction du format attendu par Plotly
  const plotData = boxData.data.map(day => {
    const {date,  min, q1, median, q3, max } = day;

    return {
      type: 'box',
      name: date,
      y: [min, q1, median, q3, max],
      boxpoints: false,
      line: { color: '#ff811f' },
      fillcolor: 'rgba(243, 204, 154, 0.3)',
      marker: { color: 'rgba(221, 0, 0, 0.3)' },
      boxmean: false, 
      hovertemplate:
      'min: %{y}<extra></extra>',
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">BoxPlot of temperatures (5 last days)</h2>
      <Plot
        data={plotData}
        layout={{
          title: '',
          autosize: true,
          margin: { t: 20 },
          yaxis: {
            title: 'Température (°C)',
            zeroline: false,
          },
          xaxis: {
            title: 'Date',
          },
          showlegend: false,
        }}
        style={{ width: '100%', height: '350px' }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default BoxPlotStats;
