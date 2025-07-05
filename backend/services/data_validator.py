import sqlite3
import numpy as np
from datetime import datetime, timedelta
from models import get_db_connection

def clean_historical_data():
    """
    Clean and validate historical temperature data
    Remove outliers and fix inconsistencies
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all temperature data
        cursor.execute('''
        SELECT id, timestamp, temperature FROM temperature_data
        ORDER BY timestamp ASC
        ''')
        
        all_data = cursor.fetchall()
        
        if not all_data:
            return {
                "success": True,
                "message": "No data to clean",
                "cleaned_count": 0
            }
        
        temperatures = [float(row['temperature']) for row in all_data]
        
        # Calculate statistics for outlier detection
        mean_temp = np.mean(temperatures)
        std_temp = np.std(temperatures)
        
        # Define reasonable temperature bounds (3 standard deviations)
        lower_bound = mean_temp - 3 * std_temp
        upper_bound = mean_temp + 3 * std_temp
        
        # Also set absolute bounds (reasonable for most climates)
        absolute_lower = -50  # -50°C
        absolute_upper = 60   # 60°C
        
        cleaned_count = 0
        
        for row in all_data:
            temp = float(row['temperature'])
            row_id = row['id']
            
            # Check if temperature is an outlier
            is_outlier = (temp < lower_bound or temp > upper_bound or 
                         temp < absolute_lower or temp > absolute_upper)
            
            if is_outlier:
                # Replace with interpolated value or mean
                corrected_temp = max(min(mean_temp, absolute_upper), absolute_lower)
                
                cursor.execute('''
                UPDATE temperature_data 
                SET temperature = ? 
                WHERE id = ?
                ''', (corrected_temp, row_id))
                
                cleaned_count += 1
                print(f"Corrected outlier: {temp}°C -> {corrected_temp}°C")
        
        # Remove duplicate entries (same timestamp and location)
        cursor.execute('''
        DELETE FROM temperature_data 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM temperature_data 
            GROUP BY timestamp, latitude, longitude
        )
        ''')
        
        duplicates_removed = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "cleaned_count": cleaned_count,
            "duplicates_removed": duplicates_removed,
            "total_records": len(all_data),
            "mean_temperature": round(mean_temp, 2),
            "std_temperature": round(std_temp, 2)
        }
        
    except Exception as e:
        print(f"Error cleaning data: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "cleaned_count": 0
        }

def validate_temperature_reading(temperature):
    """
    Validate a single temperature reading
    """
    try:
        temp = float(temperature)
        
        # Check reasonable bounds
        if temp < -50 or temp > 60:
            return False, "Temperature out of reasonable range"
        
        return True, "Valid temperature"
        
    except (ValueError, TypeError):
        return False, "Invalid temperature format"
