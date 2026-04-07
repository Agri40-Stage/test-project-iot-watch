import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime

def detect_anomalies(temperatures: list, timestamps: list) -> dict:
    """
    Detect anomalies in temperature data using two methods:
    - Z-score: simple statistical detection
    - IsolationForest: ML-based robust detection
    """
    if len(temperatures) < 5:
        return {
            "success": False,
            "message": "Not enough data to detect anomalies (minimum 5 readings required)",
            "anomalies": []
        }

    temps_array = np.array(temperatures).reshape(-1, 1)

    # --- Method 1: Z-score ---
    mean = np.mean(temperatures)
    std  = np.std(temperatures)
    z_scores = [(t - mean) / std if std > 0 else 0 for t in temperatures]

    # --- Method 2: IsolationForest ---
    model = IsolationForest(contamination=0.1, random_state=42)
    predictions = model.fit_predict(temps_array)  # -1 = anomaly, 1 = normal

    # --- Combine results ---
    anomalies = []
    for i, (temp, ts) in enumerate(zip(temperatures, timestamps)):
        is_zscore_anomaly    = abs(z_scores[i]) > 2.0
        is_isolation_anomaly = predictions[i] == -1

        if is_zscore_anomaly or is_isolation_anomaly:
            anomalies.append({
                "timestamp": ts,
                "temperature": round(temp, 2),
                "z_score": round(z_scores[i], 3),
                "detected_by": _get_detection_method(is_zscore_anomaly, is_isolation_anomaly),
                "severity": _get_severity(abs(z_scores[i]))
            })

    return {
        "success": True,
        "total_readings": len(temperatures),
        "total_anomalies": len(anomalies),
        "anomaly_rate": round(len(anomalies) / len(temperatures) * 100, 1),
        "stats": {
            "mean": round(mean, 2),
            "std": round(std, 2),
            "min": round(min(temperatures), 2),
            "max": round(max(temperatures), 2)
        },
        "method": "z_score + isolation_forest",
        "anomalies": anomalies
    }

def _get_detection_method(zscore: bool, isolation: bool) -> str:
    if zscore and isolation:
        return "both"
    elif zscore:
        return "z_score"
    return "isolation_forest"

def _get_severity(z_score_abs: float) -> str:
    if z_score_abs > 3.0:
        return "high"
    elif z_score_abs > 2.0:
        return "medium"
    return "low"