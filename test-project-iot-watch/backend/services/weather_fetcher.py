"""
Enhanced Weather Data Fetcher Service
====================================

This module handles the integration with external weather APIs to fetch
comprehensive real-time weather data and manage prediction updates.

Key Functions:
- get_current_weather(): Fetches comprehensive weather data from Open-Meteo API
- get_current_temperature(): Legacy function for temperature-only data
- update_all_predictions(): Manages daily prediction updates for the next 5 days

The service uses the Open-Meteo Forecast API which provides free weather data
without requiring API keys or authentication.

Supported Weather Parameters:
- Temperature (2m above ground)
- Relative Humidity (2m above ground)
- Wind Speed (10m above ground)
- Wind Direction (10m above ground)
- Precipitation Probability
- Weather Code (for weather conditions)
"""

import requests
import time
import sqlite3
from datetime import datetime
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from app import predict_for_day

def get_current_weather():
    """
    Get comprehensive current weather data from Open-Meteo Forecast API and store it in database.
    
    This function fetches multiple weather parameters including:
    - Temperature (2m above ground)
    - Relative Humidity (2m above ground)
    - Wind Speed (10m above ground)
    - Wind Direction (10m above ground)
    - Precipitation Probability
    - Weather Code (for weather conditions)
    
    Returns:
        dict: Dictionary containing all weather parameters
        
    Raises:
        ValueError: If weather data cannot be retrieved
        Exception: For other network or database errors
    """
    try:
        # Open-Meteo Forecast API endpoint (free weather API)
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Enhanced parameters to get comprehensive weather data
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True,  # Get current weather conditions
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m", 
                "wind_speed_10m",
                "wind_direction_10m",
                "precipitation_probability",
                "weather_code"
            ],
            "timezone": "auto"  # Automatically detect timezone
        }
        
        print(f"[{datetime.now().isoformat()}] Fetching weather data from Open-Meteo API...")
        
        # Make GET request to the weather API with timeout
        response = requests.get(url, params=params, timeout=10)
        
        if response.ok:
            data = response.json()
            
            # Check if current weather data is available in the response
            if "current_weather" in data and "hourly" in data:
                current_weather = data["current_weather"]
                hourly_data = data["hourly"]
                
                # Extract current weather parameters
                current_temp = current_weather["temperature"]
                weather_code = current_weather.get("weathercode", 0)
                timestamp = datetime.now().isoformat()
                
                # Get current hour index for hourly data
                current_hour = datetime.now().hour
                if current_hour < len(hourly_data["time"]):
                    hour_index = current_hour
                else:
                    hour_index = 0  # Fallback to first hour if current hour not available
                
                # Extract hourly weather parameters
                humidity = hourly_data["relative_humidity_2m"][hour_index] if "relative_humidity_2m" in hourly_data else None
                wind_speed = hourly_data["wind_speed_10m"][hour_index] if "wind_speed_10m" in hourly_data else None
                wind_direction = hourly_data["wind_direction_10m"][hour_index] if "wind_direction_10m" in hourly_data else None
                precipitation_prob = hourly_data["precipitation_probability"][hour_index] if "precipitation_probability" in hourly_data else None
                
                # Store the comprehensive weather data in the database
                conn = get_db_connection()
                cursor = conn.cursor()
                
                try:
                    # Insert the weather reading with all parameters
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    # Store additional weather data in a separate table if it exists
                    try:
                        cursor.execute('''
                        INSERT INTO weather_data (timestamp, temperature, humidity, wind_speed, 
                                                 wind_direction, precipitation_probability, weather_code, 
                                                 latitude, longitude)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (timestamp, current_temp, humidity, wind_speed, wind_direction, 
                              precipitation_prob, weather_code, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    except sqlite3.OperationalError:
                        # Weather data table doesn't exist, just log the data
                        print(f"Weather data table not available, storing temperature only")
                    
                    conn.commit()
                    
                    # Log comprehensive weather information
                    print(f"[{timestamp}] Weather data stored:")
                    print(f"  Temperature: {current_temp:.2f}°C")
                    print(f"  Humidity: {humidity}%" if humidity else "  Humidity: N/A")
                    print(f"  Wind Speed: {wind_speed} km/h" if wind_speed else "  Wind Speed: N/A")
                    print(f"  Wind Direction: {wind_direction}°" if wind_direction else "  Wind Direction: N/A")
                    print(f"  Precipitation Probability: {precipitation_prob}%" if precipitation_prob else "  Precipitation Probability: N/A")
                    print(f"  Weather Code: {weather_code}")
                    
                    # Calculate and log the current hour's average temperature
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
                    # Handle database locking issues with retry logic
                    if "database is locked" in str(e):
                        print("Database locked, retrying in 0.1 seconds...")
                        time.sleep(0.1)
                        return get_current_weather()
                    raise
                finally:
                    conn.close()
                
                # Return comprehensive weather data
                return {
                    "temperature": current_temp,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "wind_direction": wind_direction,
                    "precipitation_probability": precipitation_prob,
                    "weather_code": weather_code,
                    "timestamp": timestamp
                }
            
        # If we reach here, the API response didn't contain the expected data
        raise ValueError("Could not get current weather data")
            
    except requests.exceptions.Timeout:
        print("Timeout error when fetching weather data from Open-Meteo API")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Network error when fetching weather data: {str(e)}")
        raise
    except Exception as e:
        print(f"Error getting current weather: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def get_current_temperature():
    """
    Legacy function: Get current temperature from Open-Meteo Forecast API and store it in database.
    
    This function maintains backward compatibility while the enhanced get_current_weather()
    function provides more comprehensive data.
    
    Returns:
        float: Current temperature in Celsius
    """
    try:
        weather_data = get_current_weather()
        return weather_data["temperature"]
    except Exception as e:
        print(f"Error in get_current_temperature: {str(e)}")
        raise

def get_weather_forecast(days=7):
    """
    Get weather forecast for the specified number of days.
    
    Args:
        days (int): Number of days to forecast (1-7)
        
    Returns:
        dict: Forecast data with hourly predictions
    """
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "forecast_days": min(days, 7),  # Open-Meteo supports max 7 days
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "precipitation_probability",
                "weather_code"
            ],
            "timezone": "auto"
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.ok:
            data = response.json()
            return data
        else:
            raise ValueError(f"Failed to fetch forecast data: {response.status_code}")
            
    except Exception as e:
        print(f"Error fetching weather forecast: {str(e)}")
        raise

def update_all_predictions():
    """
    Update all predictions for the next 5 days.
    
    This function completely refreshes the predictions table daily by:
    1. Clearing all existing predictions from the database
    2. Generating new predictions for each of the next 5 days
    3. Storing the predictions in the database for API consumption
    4. Logging the progress and results
    
    This ensures that predictions are always based on the most recent
    weather patterns and historical data.
    
    Returns:
        bool: True if predictions were successfully updated, False otherwise
    """
    try:
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update for next 5 days...")
        
        # Clear all existing predictions to ensure fresh data
        conn = get_db_connection()
        cursor = conn.cursor()        
        cursor.execute('DELETE FROM temperature_predictions')
        conn.commit()
        print("Cleared existing predictions")
        
        # Generate predictions for each of the next 5 days
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
                continue  # Continue with next day even if current day fails
        
        print(f"[{datetime.now().isoformat()}] Successfully generated {prediction_count} hourly predictions for next 5 days")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
