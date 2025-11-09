import sqlite3
import requests
import time
import traceback
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def fetch_and_store_current_weather():
    """Get current weather from Open-Meteo API and store temperature and humidity in database"""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Updated params to request both temperature and humidity
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current": ["temperature_2m", "relative_humidity_2m"],
            "timezone": "auto"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()  # This will raise an HTTPError for bad responses (4xx or 5xx)
        
        data = response.json()
        
        if "current" in data:
            current_weather = data["current"]
            current_temp = current_weather["temperature_2m"]
            current_humidity = current_weather["relative_humidity_2m"]
            timestamp = datetime.now().isoformat()
            
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

            except sqlite3.OperationalError as e:
                if "database is locked" in str(e):
                    print("Database locked, retrying in 0.1 seconds...")
                    time.sleep(0.1)
                    # Retry the whole operation
                    return fetch_and_store_current_weather()
                raise
            finally:
                conn.close()
            
            return {"temperature": current_temp, "humidity": current_humidity}
            
        raise ValueError("Could not get current weather data from API response")
            
    except requests.exceptions.RequestException as e:
        print(f"Error making request to weather API: {str(e)}")
        # Do not re-raise; we just log the error and the scheduler will try again later
    except Exception as e:
        print(f"An unexpected error occurred in fetch_and_store_current_weather: {str(e)}")
        traceback.print_exc()
        # Do not re-raise