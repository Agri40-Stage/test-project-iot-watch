from flask import Blueprint, jsonify, request
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from services.weather_fetcher import get_current_temperature
from utils.trend_calculator import calculate_realtime_trend

latest_bp = Blueprint('latest_bp', __name__)

@latest_bp.route('/latest', methods=['GET'])
def get_latest_temperature():
    """Get the latest temperature reading and current hour's average"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        latest = cursor.fetchone()
        
        if not latest:
            current_temp = get_current_temperature()
            return jsonify({
                "time": datetime.now().isoformat(),
                "temperature": current_temp,
                "trend": "stable",
                "is_live": True
            })
        
        trend = calculate_realtime_trend(latest)
        
        current_hour = datetime.now().strftime('%Y-%m-%d %H')
        cursor.execute('''
        SELECT AVG(temperature) as avg_temp, COUNT(*) as count
        FROM temperature_data
        WHERE strftime('%Y-%m-%d %H', timestamp) = ?
        AND latitude = ? AND longitude = ?
        ''', (current_hour, latitude, longitude))
        hour_stats = cursor.fetchone()        
        
        return jsonify({
            "time": latest['timestamp'],
            "temperature": float(latest['temperature']),
            "current_hour_avg": float(hour_stats['avg_temp']) if hour_stats and hour_stats['avg_temp'] else None,
            "readings_this_hour": hour_stats['count'] if hour_stats else 0,
            "trend": trend,
            "is_live": True
        })
        
    except Exception as e:
        print(f"Error getting latest temperature: {str(e)}")
        return jsonify({"error": str(e)})
    finally:
        conn.close()