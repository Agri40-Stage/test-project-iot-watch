from flask import Blueprint, jsonify, request
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

from services.weather_fetcher import fetch_and_store_current_weather

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/history', methods=['GET'])
def get_temperature_history():
    """Get the last 10 individual temperature readings"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT timestamp, temperature
        FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 10
        ''', (latitude, longitude))
        readings = cursor.fetchall()
        
        # This block is a fallback for when the app starts with an empty database
        if not readings:
            fetch_and_store_current_weather()

            # Try fetching again now that there should be at least one record
            cursor.execute('''
            SELECT timestamp, temperature
            FROM temperature_data
            WHERE latitude = ? AND longitude = ?
            ORDER BY timestamp DESC
            LIMIT 10
            ''', (latitude, longitude))
            
            readings = cursor.fetchall()
        
        readings = readings[::-1]
        
        timestamps = [record['timestamp'] for record in readings]
        temperatures = [float(record['temperature']) for record in readings]
        
        print(f"[{datetime.now().isoformat()}] Returning {len(readings)} temperature readings")
        
        return jsonify({
            "lastTimestamps": timestamps,
            "lastTemperatures": temperatures,
            "updateInterval": 1,
            "count": len(readings),
            "isHourlyAverage": False
        })
        
    except Exception as e:
        print(f"Error getting temperature history: {str(e)}")
        return jsonify({"error": str(e)})
    finally:
        conn.close()