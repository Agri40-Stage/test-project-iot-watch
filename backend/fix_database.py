import sqlite3
import os
from datetime import datetime

def fix_weather_data_table():
    """Recreate the weather_data table with the correct schema"""
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'temperature.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Fixing weather_data table...")
    
    # Drop the existing weather_data table
    cursor.execute('DROP TABLE IF EXISTS weather_data')
    
    # Recreate the weather_data table with the correct schema
    cursor.execute('''
    CREATE TABLE weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL,
        precipitation REAL,
        wind_speed REAL,
        uv_index REAL,
        pressure REAL,
        cloud_cover REAL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        UNIQUE(timestamp, latitude, longitude)
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Weather_data table recreated successfully!")

if __name__ == "__main__":
    fix_weather_data_table() 