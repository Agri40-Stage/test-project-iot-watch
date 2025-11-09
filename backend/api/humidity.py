from flask import Blueprint, jsonify, request
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

humidity_bp = Blueprint('humidity_bp', __name__)

@humidity_bp.route('/humidity/history', methods=['GET'])
def get_humidity_history():
    """Get the last 20 individual humidity readings"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get the last 20 individual humidity readings
        cursor.execute('''
        SELECT timestamp, humidity
        FROM humidity_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 20
        ''', (latitude, longitude))
        
        readings = cursor.fetchall()
        
        # Convert to lists in chronological order
        readings = readings[::-1]
        
        timestamps = [record['timestamp'] for record in readings]
        humidities = [float(record['humidity']) for record in readings]
        
        print(f"[{datetime.now().isoformat()}] Returning {len(readings)} humidity readings")
        
        return jsonify({
            "timestamps": timestamps,
            "humidities": humidities,
            "count": len(readings)
        })
        
    except Exception as e:
        print(f"Error getting humidity history: {str(e)}")
        return jsonify({"error": str(e)})
    finally:
        conn.close()