import sqlite3
import requests
import time
from datetime import datetime

from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def get_current_temperature():
    """Get current sensor snapshot from Open-Meteo and store it in database."""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True,
            "hourly": "temperature_2m,relative_humidity_2m",
            "timezone": "auto"
        }

        response = requests.get(url, params=params)

        if response.ok:
            data = response.json()
            if "current_weather" in data:
                current_temp = data["current_weather"]["temperature"]
                timestamp = datetime.now().isoformat()
                humidity = None

                if data.get("hourly", {}).get("time") and data["hourly"].get("relative_humidity_2m"):
                    try:
                        times = data["hourly"]["time"]
                        humidity_values = data["hourly"]["relative_humidity_2m"]
                        reading_time = data["current_weather"]["time"]
                        if reading_time in times:
                            idx = times.index(reading_time)
                            humidity = humidity_values[idx]
                        else:
                            humidity = humidity_values[-1]
                    except Exception:
                        humidity = None

                conn = get_db_connection()
                cursor = conn.cursor()

                try:
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, humidity, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?)
                    ''', (timestamp, current_temp, humidity, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))

                    conn.commit()
                    print(f"[{timestamp}] Temperature stored: {current_temp:.2f}°C")

                    cursor.execute('''
                    SELECT temperature 
                    FROM temperature_data 
                    WHERE strftime('%Y-%m-%d %H', timestamp) = strftime('%Y-%m-%d %H', ?)
                    AND latitude = ? AND longitude = ?
                    ORDER BY timestamp DESC
                    LIMIT 10
                    ''', (timestamp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))

                    recent_readings = cursor.fetchall()
                    if recent_readings:
                        avg_temp = sum(r['temperature'] for r in recent_readings) / len(recent_readings)
                        print(f"Current hour average: {avg_temp:.2f}°C from {len(recent_readings)} readings")

                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print("Database locked, retrying in 0.1 seconds...")
                        time.sleep(0.1)
                        return get_current_temperature()
                    raise
                finally:
                    conn.close()

                return current_temp

        raise ValueError("Could not get current weather data")

    except Exception as e:
        print(f"Error getting current temperature: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
