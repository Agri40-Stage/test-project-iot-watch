import numpy as np
from datetime import datetime, timedelta
from .connection import get_db_connection

BASE_TEMP = 25.0
BASE_HUMIDITY = 55.0
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982


def generate_mock_data(clear_existing=True):
    """Generate more realistic mock temperature and humidity data for testing"""
    conn = get_db_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
        cursor.execute('DELETE FROM humidity_data')
    
    base_time = datetime.now() - timedelta(days=7)
    
    for i in range(168):  # 7 days * 24 hours
        timestamp = (base_time + timedelta(hours=i)).isoformat()
        day_of_week = (base_time + timedelta(hours=i)).weekday() # 0=Monday, 6=Sunday
        hour_of_day = (base_time + timedelta(hours=i)).hour

        # Simulate a daily temperature cycle (cooler at night, warmer in the afternoon)
        daily_temp_cycle = np.sin(2 * np.pi * (hour_of_day - 8) / 24) * 4 
        temperature = BASE_TEMP + daily_temp_cycle + np.random.normal(0, 0.5)
        
        # Simulate a weekly humidity cycle (e.g., more humid mid-week)
        weekly_humidity_cycle = np.sin(2 * np.pi * day_of_week / 7) * 10
        daily_humidity_cycle = -np.cos(2 * np.pi * hour_of_day / 24) * 5
        humidity = BASE_HUMIDITY + weekly_humidity_cycle + daily_humidity_cycle + np.random.normal(0, 2)
        humidity = max(20, min(95, humidity)) # Keep in realistic range

        cursor.execute('INSERT INTO temperature_data ...', (timestamp, temperature, ...))
        cursor.execute('INSERT INTO humidity_data ...', (timestamp, humidity, ...))

    conn.commit()
    conn.close()
    print("Realistic mock data generated.")
    

def purge_old_data():
    """Purge data older than 10 days"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    
    # Purge old temperature data
    cursor.execute('DELETE FROM temperature_data WHERE timestamp < ?', (threshold_date,))
    
    # Purge old humidity data
    cursor.execute('DELETE FROM humidity_data WHERE timestamp < ?', (threshold_date,))
    
    # Purge old prediction data
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('DELETE FROM temperature_predictions WHERE prediction_date < ?', (prediction_threshold,))
    
    conn.commit()
    conn.close()
    print(f"Purged data older than {threshold_date}")