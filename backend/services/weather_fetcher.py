
import sqlite3
import requests
import time
import traceback
import random  
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def fetch_and_store_current_weather():
    """Get current weather from Open-Meteo API and store temperature and humidity in database"""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "hourly": "temperature_2m,relativehumidity_2m",
            "forecast_days": 1,
            "current_weather": True,
            "timezone": "auto"
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        hourly = data.get("hourly", {})
        current_weather = data.get("current_weather", {})
        timestamps = hourly.get("time", [])
        temperatures = hourly.get("temperature_2m", [])
        humidities = hourly.get("relativehumidity_2m", [])

        if not timestamps or not temperatures or not humidities:
            raise ValueError("Could not get current weather data from API response")

        def parse_timestamp(ts):
            if ts.endswith('Z'):
                return datetime.fromisoformat(ts.replace('Z', '+00:00'))
            return datetime.fromisoformat(ts)

        timestamp = None
        current_temp = None
        current_humidity = None

        if current_weather and current_weather.get("time") and current_weather.get("temperature") is not None:
            timestamp = current_weather["time"]
            current_temp = float(current_weather["temperature"])

            # Find the matching hour for humidity in the hourly forecast
            try:
                humidity_index = timestamps.index(timestamp)
            except ValueError:
                timestamp_objs = [parse_timestamp(ts) for ts in timestamps]
                current_ts = parse_timestamp(timestamp)
                humidity_index = min(
                    range(len(timestamp_objs)),
                    key=lambda i: abs((timestamp_objs[i] - current_ts).total_seconds())
                )

            current_humidity = float(humidities[humidity_index])
        else:
            timestamp_objs = [parse_timestamp(ts) for ts in timestamps]
            now = datetime.now(timestamp_objs[0].tzinfo) if timestamp_objs[0].tzinfo else datetime.now()
            closest_index = min(
                range(len(timestamp_objs)),
                key=lambda i: abs((timestamp_objs[i] - now).total_seconds())
            )
            timestamp = timestamps[closest_index]
            current_temp = float(temperatures[closest_index])
            current_humidity = float(humidities[closest_index])

        current_temp += random.uniform(-0.15, 0.15)
        current_humidity += random.uniform(-0.5, 0.5)
        current_humidity = max(0, min(100, current_humidity))

        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
            INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
            VALUES (?, ?, ?, ?)
            ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
            print(f"[{timestamp}] Temperature stored: {current_temp:.2f}°C")
            
            cursor.execute('''
            INSERT INTO humidity_data (timestamp, humidity, latitude, longitude)
            VALUES (?, ?, ?, ?)
            ''', (timestamp, current_humidity, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
            print(f"[{timestamp}] Humidity stored: {current_humidity:.2f}%")

            conn.commit()
        finally:
            conn.close()

        return {"temperature": current_temp, "humidity": current_humidity}
            
    except requests.exceptions.RequestException as e:
        print(f"Error making request to weather API: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred in fetch_and_store_current_weather: {str(e)}")
        traceback.print_exc()