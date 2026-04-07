import requests
import time
import sqlite3
from datetime import datetime
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from app import predict_for_day

def get_current_temperature():
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True,
            "hourly": "temperature_2m",
            "timezone": "auto"
        }
        
        response = requests.get(url, params=params)
        print("Status code:", response.status_code)
        print("Response:", response.text[:500])
        
        if response.ok:
            data = response.json()
            print("Keys in data:", list(data.keys()))
            
            if "current_weather" in data:
                current_temp = data["current_weather"]["temperature"]
                timestamp = datetime.now().isoformat()
                
                conn = get_db_connection()
                cursor = conn.cursor()
                
                try:
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    conn.commit()
                    print(f"[{timestamp}] Temperature stored: {current_temp:.2f}°C")
                    
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print("Database locked, retrying...")
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

def update_all_predictions():
    try:
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update...")
        
        conn = get_db_connection()
        cursor = conn.cursor()        
        cursor.execute('DELETE FROM temperature_predictions')
        conn.commit()
        print("Cleared existing predictions")
        
        prediction_count = 0
        for day in range(1, 6):
            try:
                result = predict_for_day(day)
                if "error" in result:
                    print(f"Error predicting day {day}: {result['error']}")
                else:
                    prediction_count += len(result.get("predictions", []))
                    print(f"Successfully generated predictions for day {day}")
            except Exception as e:
                print(f"Error processing day {day}: {str(e)}")
                continue
        
        print(f"Done: {prediction_count} predictions generated")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        import traceback
        traceback.print_exc()
        return False