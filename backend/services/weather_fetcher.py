
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
            "current": ["temperature_2m", "relative_humidity_2m"],
            "timezone": "auto"
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if "current" in data:
            current_weather = data["current"]
            current_temp = current_weather["temperature_2m"]
            current_humidity = current_weather["relative_humidity_2m"]
            timestamp = datetime.now().isoformat()
            
            current_temp += random.uniform(-0.15, 0.15)
            current_humidity += random.uniform(-0.5, 0.5)
            current_humidity = max(0, min(100, current_humidity))

            conn = get_db_connection()
            cursor = conn.cursor()
            
            try:
                # Store temperature
                cursor.execute('''
                INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                VALUES (?, ?, ?, ?)
                ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                print(f"[{timestamp}] Temperature stored: {current_temp:.2f}°C")
                
                # Store humidity
                cursor.execute('''
                INSERT INTO humidity_data (timestamp, humidity, latitude, longitude)
                VALUES (?, ?, ?, ?)
                ''', (timestamp, current_humidity, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                print(f"[{timestamp}] Humidity stored: {current_humidity:.2f}%")

                conn.commit()
            finally:
                conn.close()
            
            return {"temperature": current_temp, "humidity": current_humidity}
            
        raise ValueError("Could not get current weather data from API response")
            
    except requests.exceptions.RequestException as e:
        print(f"Error making request to weather API: {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred in fetch_and_store_current_weather: {str(e)}")
        traceback.print_exc()