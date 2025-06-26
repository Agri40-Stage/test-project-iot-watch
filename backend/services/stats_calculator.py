import sqlite3
import pandas as pd
from datetime import datetime, timedelta
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def calculate_weekly_stats(latitude=DEFAULT_LATITUDE, longitude=DEFAULT_LONGITUDE):
    """
    Calculate comprehensive weekly temperature statistics
    Returns daily min, max, average temperatures for the last 7 days
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get data from the last 7 days
        time_threshold = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
        
        cursor.execute('''
        SELECT timestamp, temperature FROM temperature_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ?
        ORDER BY timestamp ASC
        ''', (latitude, longitude, time_threshold))
        
        all_data = cursor.fetchall()
        conn.close()
        
        if not all_data:
            return {
                "success": False,
                "message": "No data available for the last 7 days",
                "dates": [],
                "minTemps": [],
                "maxTemps": [],
                "avgTemps": [],
                "totalReadings": 0
            }
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame([{
            'timestamp': row['timestamp'],
            'temperature': float(row['temperature'])
        } for row in all_data])
        
        # Parse timestamps and extract dates
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['date'] = df['timestamp'].dt.strftime('%Y-%m-%d')
        
        # Group by date and calculate statistics
        daily_stats = df.groupby('date').agg({
            'temperature': ['min', 'max', 'mean', 'count']
        }).reset_index()
        
        # Flatten column names
        daily_stats.columns = ['date', 'min_temp', 'max_temp', 'avg_temp', 'count']
        
        # Round temperatures to 1 decimal place
        daily_stats['min_temp'] = daily_stats['min_temp'].round(1)
        daily_stats['max_temp'] = daily_stats['max_temp'].round(1)
        daily_stats['avg_temp'] = daily_stats['avg_temp'].round(1)
        
        # Convert to lists for JSON response
        dates = daily_stats['date'].tolist()
        min_temps = daily_stats['min_temp'].tolist()
        max_temps = daily_stats['max_temp'].tolist()
        avg_temps = daily_stats['avg_temp'].tolist()
        daily_counts = daily_stats['count'].tolist()
        
        # Calculate overall statistics
        overall_stats = {
            "overall_min": float(df['temperature'].min()),
            "overall_max": float(df['temperature'].max()),
            "overall_avg": float(df['temperature'].mean()),
            "total_readings": len(df),
            "days_with_data": len(daily_stats)
        }
        
        return {
            "success": True,
            "dates": dates,
            "minTemps": min_temps,
            "maxTemps": max_temps,
            "avgTemps": avg_temps,
            "dailyCounts": daily_counts,
            "overallStats": overall_stats,
            "period": "7 days"
        }
        
    except Exception as e:
        print(f"Error calculating weekly stats: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "dates": [],
            "minTemps": [],
            "maxTemps": [],
            "avgTemps": []
        }

def get_temperature_trends():
    """
    Calculate temperature trends over different time periods
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get data for trend analysis
        cursor.execute('''
        SELECT timestamp, temperature FROM temperature_data
        ORDER BY timestamp DESC
        LIMIT 48
        ''')
        
        recent_data = cursor.fetchall()
        conn.close()
        
        if len(recent_data) < 24:
            return {
                "trend_24h": "insufficient_data",
                "trend_direction": "unknown",
                "temperature_change": 0
            }
        
        # Calculate 24-hour trend
        latest_24h = [float(row['temperature']) for row in recent_data[:24]]
        previous_24h = [float(row['temperature']) for row in recent_data[24:48]] if len(recent_data) >= 48 else latest_24h
        
        current_avg = sum(latest_24h) / len(latest_24h)
        previous_avg = sum(previous_24h) / len(previous_24h)
        
        temperature_change = current_avg - previous_avg
        
        if abs(temperature_change) < 0.5:
            trend = "stable"
        elif temperature_change > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
        
        return {
            "trend_24h": trend,
            "temperature_change": round(temperature_change, 2),
            "current_avg": round(current_avg, 1),
            "previous_avg": round(previous_avg, 1)
        }
        
    except Exception as e:
        print(f"Error calculating trends: {str(e)}")
        return {
            "trend_24h": "error",
            "temperature_change": 0
        }
