import React, { useEffect, useState } from "react";


import { fetchAnomalies } from "../api/anomalies";
import AnomalyAlert from "./AnomalyAlert";

export default function AnomalyPanel() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchAnomalies(100)
      .then(setData)
      .catch(() => setError("Failed to load anomalies"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading anomalies...</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!data?.success) return <p>No anomaly data available.</p>;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>⚠️ Anomaly Detection</h2>
        <span style={{ fontSize: '13px', color: '#666' }}>
          {data.total_anomalies} anomalies / {data.total_readings} readings ({data.anomaly_rate}%)
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Mean',  value: `${data.stats.mean}°C` },
          { label: 'Min',   value: `${data.stats.min}°C`  },
          { label: 'Max',   value: `${data.stats.max}°C`  },
          { label: 'Std',   value: `${data.stats.std}°C`  },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px', padding: '8px'
          }}>
            <div style={{ fontSize: '11px', color: '#888' }}>{stat.label}</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Anomaly list — show only top 10 */}
      <div>
        {data.anomalies.slice(0, 10).map((anomaly, i) => (
          <AnomalyAlert key={i} anomaly={anomaly} />
        ))}
        {data.total_anomalies > 10 && (
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px' }}>
            + {data.total_anomalies - 10} more anomalies detected
          </p>
        )}
      </div>

    </div>
  );
}