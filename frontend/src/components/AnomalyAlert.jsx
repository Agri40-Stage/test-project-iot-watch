import React from "react";

const severityConfig = {
  high:   { color: '#ef4444', bg: '#fef2f2', label: '🔴 High' },
  medium: { color: '#f97316', bg: '#fff7ed', label: '🟠 Medium' },
  low:    { color: '#eab308', bg: '#fefce8', label: '🟡 Low' },
};

export default function AnomalyAlert({ anomaly }) {
  const config = severityConfig[anomaly.severity] || severityConfig.low;

  return (
    <div style={{
      backgroundColor: config.bg,
      borderLeft: `4px solid ${config.color}`,
      borderRadius: '8px',
      padding: '10px 14px',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: config.color }}>
          {config.label} — {anomaly.temperature}°C
        </span>
        <span style={{ fontSize: '12px', color: '#888' }}>
          {new Date(anomaly.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
        Detected by: <strong>{anomaly.detected_by}</strong> | Z-score: {anomaly.z_score}
      </div>
    </div>
  );
}