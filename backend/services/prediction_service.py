
import traceback
import requests
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def update_all_predictions():
    """
    Update all predictions for the next 5 days by fetching a real forecast from Open-Meteo.
    This is the single source of truth for all prediction data.
    """
    try:
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update from forecast API...")
        
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "hourly": "temperature_2m",
            "forecast_days": 5 
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        forecast_data = response.json()

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM temperature_predictions')
        
        timestamps = forecast_data['hourly']['time']
        temperatures = forecast_data['hourly']['temperature_2m']

        for i in range(len(timestamps)):
            ts_obj = datetime.fromisoformat(timestamps[i])
            cursor.execute('''
            INSERT INTO temperature_predictions 
            (prediction_date, target_date, hour, temperature, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (datetime.now().isoformat(), ts_obj.isoformat(), ts_obj.hour, temperatures[i], DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
        
        conn.commit()
        conn.close()
        print(f"Successfully stored {len(timestamps)} hourly forecast points.")
        return True
    except Exception as e:
        print(f"Error updating predictions from forecast: {str(e)}")
        traceback.print_exc()
        return False