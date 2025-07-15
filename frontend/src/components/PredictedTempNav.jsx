import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const PredictedTempNav = () => {
  const [avgTemp, setAvgTemp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/predict`);
        if (!res.ok) throw new Error("Failed to fetch predicted temp");
        const data = await res.json();
        setAvgTemp(data.avg_temp.toFixed(1));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPrediction();
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-white bg-orange-500 px-3 py-1 rounded-md shadow-sm">
      <span>🌤️</span>
      {error ? (
        <span className="text-red-100">Err loading temp</span>
      ) : avgTemp ? (
        <span>
          Tomorrow: <strong>{avgTemp}°C</strong>
        </span>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
};

export default PredictedTempNav;
