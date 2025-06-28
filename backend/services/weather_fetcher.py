import requests
import time
import sqlite3
from datetime import datetime
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def get_current_temperature_and_humidity():
    """Get current temperature and humidity from Open-Meteo Forecast API and store them in database"""
    try:
        # Open-Meteo Forecast API endpoint
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Parameters to get current weather for Agadir
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True,
            "hourly": "temperature_2m,relative_humidity_2m",
            "timezone": "auto"
        }
        
        # Make GET request
        response = requests.get(url, params=params)
        
        if response.ok:
            data = response.json()
            
            if "current_weather" in data and "hourly" in data:
                current_temp = data["current_weather"]["temperature"]
                
                # Get current humidity from hourly data (closest to current time)
                current_hour_index = 0  # First hour is usually current
                current_humidity = data["hourly"]["relative_humidity_2m"][current_hour_index]
                
                timestamp = datetime.now().isoformat()
                
                # Store in database
                conn = get_db_connection()
                cursor = conn.cursor()
                
                try:
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    cursor.execute('''
                    INSERT INTO humidity_data (timestamp, humidity, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_humidity, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    conn.commit()
                    print(f"[{timestamp}] Data stored - Temperature: {current_temp:.2f}°C, Humidity: {current_humidity:.1f}%")
                    
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print("Database locked, retrying in 0.1 seconds...")
                        time.sleep(0.1)
                        return get_current_temperature_and_humidity()
                    raise
                finally:
                    conn.close()
                
                return current_temp, current_humidity
            
        raise ValueError("Could not get current weather data")
            
    except Exception as e:
        print(f"Error getting current weather: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def update_all_predictions():
    """
    Update all predictions for the next 5 days.
    This completely refreshes the predictions table daily.
    """
    try:
        # Import here to avoid circular imports
        from app import predict_for_day, predict_humidity_for_day
        
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update for next 5 days...")
        
        conn = get_db_connection()
        cursor = conn.cursor()        
        cursor.execute('DELETE FROM temperature_predictions')
        cursor.execute('DELETE FROM humidity_predictions')
        conn.commit()
        print("Cleared existing predictions")
        
        prediction_count = 0
        humidity_prediction_count = 0
        
        for day in range(1, 6):
            try:
                # Temperature predictions
                result = predict_for_day(day)
                if "error" in result:
                    print(f"Error predicting temperature for day {day}: {result['error']}")
                else:
                    prediction_count += len(result.get("predictions", []))
                    print(f"Successfully generated temperature predictions for day {day}")
                
                # Humidity predictions
                humidity_result = predict_humidity_for_day(day)
                if "error" in humidity_result:
                    print(f"Error predicting humidity for day {day}: {humidity_result['error']}")
                else:
                    humidity_prediction_count += len(humidity_result.get("predictions", []))
                    print(f"Successfully generated humidity predictions for day {day}")
                    
            except Exception as e:
                print(f"Error processing day {day}: {str(e)}")
                continue
        
        print(f"[{datetime.now().isoformat()}] Successfully generated {prediction_count} temperature predictions and {humidity_prediction_count} humidity predictions for next 5 days")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def get_current_temperature():
    """Get current temperature from Open-Meteo Forecast API and store it in database"""
    try:
        temp, _ = get_current_temperature_and_humidity()
        return temp
    except Exception as e:
        print(f"Error getting current temperature: {str(e)}")
        raise

def get_current_humidity():
    """Get current humidity from Open-Meteo Forecast API and store it in database"""
    try:
        _, humidity = get_current_temperature_and_humidity()
        return humidity
    except Exception as e:
        print(f"Error getting current humidity: {str(e)}")
        raise
