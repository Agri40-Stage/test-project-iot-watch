import numpy as np
from datetime import datetime, timedelta
from .connection import get_db_connection

BASE_TEMP = 25.0
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982

def generate_mock_data(clear_existing=True):
    """Generate mock temperature data for testing"""
    conn = get_db_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
    base_time = datetime.now() - timedelta(days=7)
    for i in range(168):
        timestamp = (base_time + timedelta(hours=i)).isoformat()
        temperature = BASE_TEMP + np.random.normal(0, 2)
        cursor.execute('''
        INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
        VALUES (?, ?, ?, ?)
        ''', (timestamp, temperature, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
    conn.commit()
    conn.close()
    print("Mock data generated successfully")

def purge_old_data():
    """Purge data older than 10 days"""
    conn = get_db_connection()
    cursor = conn.cursor()
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    cursor.execute('DELETE FROM temperature_data WHERE timestamp < ?', (threshold_date,))
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('DELETE FROM temperature_predictions WHERE prediction_date < ?', (prediction_threshold,))
    conn.commit()
    conn.close()
    print(f"Purged data older than {threshold_date}")