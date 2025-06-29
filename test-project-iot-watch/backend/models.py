"""
Database Models and Machine Learning Functions
=============================================

This module handles:
- SQLite database connection and initialization
- Temperature data storage and retrieval
- Machine learning model loading and predictions
- Mock data generation for testing
- Database maintenance and cleanup

The database stores two main types of data:
1. temperature_data: Real-time temperature readings
2. temperature_predictions: ML-generated temperature forecasts
"""

import sqlite3
import os
from datetime import datetime, timedelta
import numpy as np
from tensorflow.keras.models import load_model

# Default location coordinates (Agadir, Morocco)
BASE_TEMP = 25.0  # Base temperature for mock data generation
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982

def get_db_connection():
    """
    Create and return a database connection to the SQLite database.
    
    The database file is located in the 'database' subdirectory relative to this file.
    The connection is configured to return rows as dictionaries for easier access.
    
    Returns:
        sqlite3.Connection: Database connection object
    """
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'temperature.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def generate_mock_data(clear_existing=True):
    """
    Generate mock temperature data for testing and development.
    
    This function creates realistic temperature data for the last 7 days,
    with random variations around a base temperature. This is useful for
    testing the application when real API data is not available.
    
    Args:
        clear_existing (bool): If True, removes all existing data before generating new data
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
    
    # Generate data for the last 7 days (168 hours)
    base_time = datetime.now() - timedelta(days=7)
    for i in range(168):
        timestamp = (base_time + timedelta(hours=i)).isoformat()
        # Generate temperature with random variation around base temperature
        temperature = BASE_TEMP + np.random.normal(0, 2)
        cursor.execute('''
        INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
        VALUES (?, ?, ?, ?)
        ''', (timestamp, temperature, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
    
    conn.commit()
    conn.close()
    print("Mock data generated successfully")

def init_db():
    """
    Initialize the database by creating necessary tables and indexes.
    
    This function:
    1. Creates the temperature_data table for storing real-time readings
    2. Creates the temperature_predictions table for ML forecasts
    3. Creates indexes for better query performance
    4. Populates the database with mock data if it's empty
    5. Cleans up old data to prevent database bloat
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create temperature_data table for storing real-time temperature readings
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')
    
    # Create temperature_predictions table for storing ML-generated forecasts
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_date TEXT NOT NULL,
        target_date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        UNIQUE(target_date, hour, latitude, longitude)
    )
    ''')
    
    # Create indexes for faster querying
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_target_date ON temperature_predictions(target_date)')
    
    conn.commit()
    
    # Check if database is empty and populate with mock data if needed
    cursor.execute('SELECT COUNT(*) FROM temperature_data')
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("Database is empty. Populating with mock data...")
        conn.close()
        generate_mock_data()
    else:
        conn.close()
        purge_old_data()

def purge_old_data():
    """
    Remove old data from the database to prevent it from growing too large.
    
    This function:
    - Removes temperature readings older than 10 days
    - Removes predictions older than 5 days
    - Helps maintain database performance and storage efficiency
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Keep data for 10 days instead of 7
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_data
    WHERE timestamp < ?
    ''', (threshold_date,))
    
    # Delete predictions older than 5 days
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_predictions
    WHERE prediction_date < ?
    ''', (prediction_threshold,))
    
    conn.commit()
    conn.close()
    print(f"Purged data older than {threshold_date}")

def load_prediction_model():
    """
    Load the Keras machine learning model for temperature prediction.
    
    This function attempts to load the ML model from multiple possible locations
    and provides detailed logging for debugging purposes.
    
    The model is used to predict temperature values for future dates based on
    historical patterns and weather data.
    
    Returns:
        keras.Model: Loaded Keras model for temperature prediction
        
    Raises:
        ValueError: If the model cannot be loaded from any location
    """
    
    # Define possible model paths (check both model/ subdirectory and current directory)
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    possible_paths = [
        os.path.join(model_dir, 'ml.keras'),
        os.path.join(os.path.dirname(__file__), 'ml.keras')
    ]
    
    print(f"Attempting to load model from possible paths:")
    for path in possible_paths:
        print(f"Checking path: {path}")
        print(f"Path exists: {os.path.exists(path)}")
    
    # Try each possible path until one works
    for model_path in possible_paths:
        try:
            if os.path.exists(model_path):
                print(f"Loading model from: {model_path}")
                model = load_model(model_path, compile=False)
                print(f"Successfully loaded Keras model from {model_path} (cached)")
                return model
            else:
                print(f"Model file not found at: {model_path}")
        except Exception as e:
            print(f"Error loading model from {model_path}:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    raise ValueError("Could not load the prediction model from any of the specified paths")

def standardize_timestamp(timestamp):
    """
    Convert any timestamp format to a standardized YYYY-MM-DD HH:MM format.
    
    This function handles various timestamp formats and converts them to a
    consistent format for database storage and comparison.
    
    Args:
        timestamp: Timestamp in various formats (string, datetime object, etc.)
        
    Returns:
        str: Standardized timestamp in YYYY-MM-DD HH:MM format
    """
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            dt = timestamp
        return dt.strftime('%Y-%m-%d %H:%M')
    except:
        return datetime.now().strftime('%Y-%m-%d %H:%M')
