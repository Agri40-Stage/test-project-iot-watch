import numpy as np
from sklearn.ensemble import IsolationForest


class AnomalyDetector:
    def __init__(self):
        # Isolation Forest model
        self.model = IsolationForest(
            contamination=0.05,   # expected % of anomalies
            random_state=42
        )

    # -----------------------------
    # Z-SCORE METHOD
    # -----------------------------
    def detect_zscore(self, data):
        temps = np.array([d["temperature"] for d in data])

        mean = np.mean(temps)
        std = np.std(temps)

        anomalies = []

        for d in data:
            temp = d["temperature"]

            if std == 0:
                z = 0
            else:
                z = (temp - mean) / std

            abs_z = abs(z)

            if abs_z > 2:
                anomalies.append({
                    "timestamp": d["timestamp"],
                    "temperature": temp,
                    "severity": self._get_severity_zscore(abs_z),
                    "method": "z-score"
                })

        return anomalies

    # -----------------------------
    # ISOLATION FOREST METHOD
    # -----------------------------
    def detect_isolation_forest(self, data):
        temps = np.array([d["temperature"] for d in data]).reshape(-1, 1)

        if len(temps) < 10:
            return []  # not enough data

        self.model.fit(temps)
        preds = self.model.predict(temps)

        anomalies = []

        for i, d in enumerate(data):
            if preds[i] == -1:
                anomalies.append({
                    "timestamp": d["timestamp"],
                    "temperature": d["temperature"],
                    "severity": "high",
                    "method": "isolation_forest"
                })

        return anomalies

    # -----------------------------
    # COMBINED METHOD
    # -----------------------------
    def detect_all(self, data):
        if not data:
            return []

        zscore_anomalies = self.detect_zscore(data)
        iso_anomalies = self.detect_isolation_forest(data)

        # optional: remove duplicates (same timestamp)
        seen = set()
        combined = []

        for a in zscore_anomalies + iso_anomalies:
            key = (a["timestamp"], a["temperature"])
            if key not in seen:
                seen.add(key)
                combined.append(a)

        return combined

    # -----------------------------
    # SEVERITY HELPERS
    # -----------------------------
    def _get_severity_zscore(self, abs_z):
        if abs_z > 3:
            return "high"
        elif abs_z > 2.5:
            return "medium"
        else:
            return "low"