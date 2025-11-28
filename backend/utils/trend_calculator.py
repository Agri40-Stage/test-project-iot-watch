from datetime import datetime, timedelta

from db.connection import get_db_connection


def calculate_realtime_trend(latest_reading):
    """Calculate a real-time trend based on recent data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Define a 2-minute window for trend calculation, ending at the timestamp of the latest reading
        time_threshold = (datetime.fromisoformat(latest_reading['timestamp']) - timedelta(minutes=2)).isoformat()

        # Get the average temperature over that 2-minute window
        cursor.execute('''
        SELECT AVG(temperature) as recent_avg
        FROM temperature_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ? AND timestamp < ?
        ''', (latest_reading['latitude'], latest_reading['longitude'], time_threshold, latest_reading['timestamp']))
        
        recent_stats = cursor.fetchone()
        
        # Calculate trend
        trend = "stable"
        if recent_stats and recent_stats['recent_avg'] is not None:
            if latest_reading['temperature'] > recent_stats['recent_avg']:
                trend = "up"
            elif latest_reading['temperature'] < recent_stats['recent_avg']:
                trend = "down"
        
        return trend
    
    except Exception as e:
        print(f"Error calculating trend: {str(e)}")
        # In case of an error, it's safer to return "stable" than to crash
        return "stable"

    finally:
        conn.close()