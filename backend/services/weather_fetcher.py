import requests
import time
from datetime import datetime
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from app import predict_for_day

def get_current_temperature():
    """Get current temperature from Open-Meteo Forecast API and store it in database"""
    try:
        # Open-Meteo Forecast API endpoint
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Parameters to get comprehensive weather data for agriculture
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m",
                "pressure_msl",
                "cloud_cover",
                "uv_index"
            ],
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m",
                "pressure_msl",
                "cloud_cover",
                "uv_index",
                "soil_temperature_0_to_7cm",
                "soil_moisture_0_to_7cm"
            ],
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "rain_sum",
                "snowfall_sum",
                "wind_speed_10m_max",
                "wind_direction_10m_dominant",
                "sunshine_duration",
                "uv_index_max",
                "precipitation_hours"
            ],
            "timezone": "auto"
        }
        
        # Make GET request
        response = requests.get(url, params=params)
        
        if response.ok:
            data = response.json()
            
            if "current" in data:
                current_data = data["current"]
                timestamp = datetime.now().isoformat()
                
                # Extract current weather data
                current_temp = current_data.get("temperature_2m", 0)
                current_humidity = current_data.get("relative_humidity_2m", 0)
                current_precipitation = current_data.get("precipitation", 0)
                current_wind_speed = current_data.get("wind_speed_10m", 0)
                current_uv_index = current_data.get("uv_index", 0)
                current_pressure = current_data.get("pressure_msl", 0)
                current_cloud_cover = current_data.get("cloud_cover", 0)
                
                # Store in database
                conn = get_db_connection()
                cursor = conn.cursor()
                
                try:
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    # Store additional weather data in a new table
                    cursor.execute('''
                    INSERT OR REPLACE INTO weather_data 
                    (timestamp, temperature, humidity, precipitation, wind_speed, uv_index, pressure, cloud_cover, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (timestamp, current_temp, current_humidity, current_precipitation, 
                         current_wind_speed, current_uv_index, current_pressure, current_cloud_cover,
                         DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    conn.commit()
                    print(f"[{timestamp}] Weather data stored: Temp={current_temp:.1f}°C, Humidity={current_humidity:.1f}%, "
                          f"Precip={current_precipitation:.1f}mm, Wind={current_wind_speed:.1f}km/h, UV={current_uv_index:.1f}")
                    
                    # Get the last 10 readings for this hour
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

def update_all_predictions():
    """
    Update all predictions for the next 5 days.
    This completely refreshes the predictions table daily.
    """
    try:
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update for next 5 days...")
        
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
        
        print(f"[{datetime.now().isoformat()}] Successfully generated {prediction_count} hourly predictions for next 5 days")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
