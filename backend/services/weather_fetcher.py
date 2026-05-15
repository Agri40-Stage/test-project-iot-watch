import requests
import time
import sqlite3
from datetime import datetime
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from app import predict_for_day
from logging_config import get_logger

logger = get_logger(__name__)

def get_current_temperature():
    """Get current temperature from Open-Meteo Forecast API and store it in database"""
    try:
        # Open-Meteo Forecast API endpoint
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Parameters to get current weather for Agadir
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True,
            "hourly": "temperature_2m",
            "timezone": "auto"
        }
        
        # Make GET request
        response = requests.get(url, params=params)
        
        if response.ok:
            data = response.json()
            
            if "current_weather" in data:
                current_temp = data["current_weather"]["temperature"]
                timestamp = datetime.now().isoformat()
                
                # Store in database
                conn = get_db_connection()
                cursor = conn.cursor()
                
                try:
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    conn.commit()
                    logger.info(
                        "Temperature stored",
                        extra={"timestamp": timestamp, "temperature": round(current_temp, 2)},
                    )
                    
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
                        logger.info(
                            "Computed current hour average",
                            extra={"avg_temp": round(avg_temp, 2), "count": len(recent_readings)},
                        )
                    
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        logger.warning("Database locked, retrying temperature insert")
                        time.sleep(0.1)
                        return get_current_temperature()
                    raise
                finally:
                    conn.close()
                
                return current_temp
            
        raise ValueError("Could not get current weather data")
            
    except Exception as e:
        logger.exception("Error getting current temperature", extra={"error": str(e)})
        raise

def update_all_predictions():
    """
    Update all predictions for the next 5 days.
    This completely refreshes the predictions table daily.
    """
    try:
        logger.info("Starting daily prediction update for next 5 days")
        
        conn = get_db_connection()
        cursor = conn.cursor()        
        cursor.execute('DELETE FROM temperature_predictions')
        conn.commit()
        logger.info("Cleared existing predictions")
        
        prediction_count = 0
        for day in range(1, 6):
            try:
                result = predict_for_day(day)
                if "error" in result:
                    logger.error("Error predicting day", extra={"day": day, "error": result['error']})
                else:
                    prediction_count += len(result.get("predictions", []))
                    logger.info("Generated predictions for day", extra={"day": day})
            except Exception as e:
                logger.exception("Error processing day", extra={"day": day, "error": str(e)})
                continue
        
        logger.info(
            "Generated hourly predictions for next 5 days",
            extra={"prediction_count": prediction_count},
        )
        return True
    except Exception as e:
        logger.exception("Error updating predictions", extra={"error": str(e)})
        return False
