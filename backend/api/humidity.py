
from flask import Blueprint, jsonify, request
from datetime import datetime
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

humidity_bp = Blueprint('humidity_bp', __name__)

@humidity_bp.route('/humidity/history', methods=['GET'])
def get_humidity_history():
    """
    Get the average humidity for each of the last 20 minutes.
    This aggregates the raw data into more meaningful minute-by-minute averages.
    """
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # This SQL query groups all readings by the minute they occurred,
        # calculates the average humidity for that minute, and returns
        # the last 20 minutes of data.
        cursor.execute('''
            SELECT
                strftime('%Y-%m-%dT%H:%M:00', timestamp) as minute_timestamp,
                AVG(humidity) as average_humidity
            FROM
                humidity_data
            WHERE
                latitude = ? AND longitude = ?
            GROUP BY
                minute_timestamp
            ORDER BY
                minute_timestamp DESC
            LIMIT 20
        ''', (latitude, longitude))
        
        readings = cursor.fetchall()
        
        # Convert to lists in chronological order
        readings = readings[::-1]
        
        # The column names are now 'minute_timestamp' and 'average_humidity'
        timestamps = [record['minute_timestamp'] for record in readings]
        humidities = [float(record['average_humidity']) for record in readings]
        
        print(f"[{datetime.now().isoformat()}] Returning {len(readings)} minutes of average humidity data")
        
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


@humidity_bp.route('/humidity/latest', methods=['GET'])
def get_latest_humidity():
    """Get the latest humidity reading"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT timestamp, humidity FROM humidity_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        latest = cursor.fetchone()
        
        if not latest:
            return jsonify({"error": "No humidity data available"}), 404
            
        return jsonify({
            "time": latest['timestamp'],
            "humidity": float(latest['humidity'])
        })
        
    except Exception as e:
        print(f"Error getting latest humidity: {str(e)}")
        return jsonify({"error": str(e)})
    finally:
        conn.close()