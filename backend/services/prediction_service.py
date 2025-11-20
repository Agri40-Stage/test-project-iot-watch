import time
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler

from models import (
    get_db_connection,
    load_prediction_model,
    DEFAULT_LATITUDE,
    DEFAULT_LONGITUDE,
)


def predict_for_day(day: int):
    """Generate temperature predictions for a specific day and store in database."""
    if day < 1 or day > 5:
        raise ValueError("Day parameter must be between 1 and 5")

    model = load_prediction_model()
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow + timedelta(days=day - 1)
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(days=1)

        cursor.execute(
            """
            SELECT timestamp, temperature FROM temperature_data
            ORDER BY timestamp DESC
            LIMIT 168
            """
        )
        history = cursor.fetchall()

        if not history:
            raise ValueError("No historical data available for predictions")

        historical_temps = np.array(
            [record["temperature"] for record in history], dtype=np.float32
        )
        scaler = MinMaxScaler(feature_range=(-1, 1))
        data_scaled = scaler.fit_transform(historical_temps.reshape(-1, 1))

        if len(data_scaled) < 30:
            pad_amount = 30 - len(data_scaled)
            data_scaled = np.pad(data_scaled, ((pad_amount, 0), (0, 0)), mode="wrap")

        sequence = data_scaled[-30:].reshape(1, 30, 1)
        predictions = model.predict(sequence, verbose=0)
        base_temp = float(scaler.inverse_transform(predictions)[0][0])

        hourly_predictions = []
        timestamps = []

        day_of_year = start_time.timetuple().tm_yday
        seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 3.0

        for hour in range(24):
            timestamp = start_time + timedelta(hours=hour)
            hour_factor = np.cos(2 * np.pi * ((hour - 14) / 24))
            daily_variation = 3.0 * hour_factor
            noise = np.random.normal(0, 0.2)
            temperature = base_temp + daily_variation + seasonal_factor + noise

            attempts = 0
            while attempts < 3:
                try:
                    cursor.execute(
                        """
                        INSERT INTO temperature_predictions
                        (prediction_date, target_date, hour, temperature, latitude, longitude)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            datetime.now().isoformat(),
                            timestamp.isoformat(),
                            hour,
                            float(temperature),
                            DEFAULT_LATITUDE,
                            DEFAULT_LONGITUDE,
                        ),
                    )
                    hourly_predictions.append(float(temperature))
                    timestamps.append(timestamp.isoformat())
                    break
                except Exception as exc:
                    if "database is locked" in str(exc).lower():
                        attempts += 1
                        time.sleep(0.1)
                        continue
                    raise

        conn.commit()
        return {
            "day": day,
            "date": start_time.strftime("%Y-%m-%d"),
            "day_of_week": start_time.strftime("%A"),
            "timestamps": timestamps,
            "predictions": hourly_predictions,
            "min_temp": min(hourly_predictions) if hourly_predictions else None,
            "max_temp": max(hourly_predictions) if hourly_predictions else None,
            "avg_temp": (
                sum(hourly_predictions) / len(hourly_predictions)
                if hourly_predictions
                else None
            ),
        }
    finally:
        conn.close()


def update_all_predictions():
    """Refresh the predictions table with 5 days of hourly forecasts."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM temperature_predictions")
        conn.commit()

        prediction_count = 0
        for day in range(1, 6):
            try:
                result = predict_for_day(day)
                prediction_count += len(result.get("predictions", []))
            except Exception as exc:
                print(f"Error processing day {day}: {exc}")
                continue

        print(
            f"[{datetime.now().isoformat()}] Generated {prediction_count} hourly predictions for next 5 days"
        )
        return True
    finally:
        conn.close()

