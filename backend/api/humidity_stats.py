
import pandas as pd
import traceback
import requests
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from utils.time_formatter import standardize_timestamp

humidity_stats_bp = Blueprint('humidity_stats_bp', __name__)

@humidity_stats_bp.route('/humidity/weekly-stats', methods=['GET'])
def get_weekly_humidity_stats():
    """Get min, max, and average humidity for the last 7 days from DB, with API fallback."""
    try:
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        time_threshold = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
        
        cursor.execute('''
        SELECT * FROM humidity_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ?
        ORDER BY timestamp ASC
        ''', (latitude, longitude, time_threshold))
        
        all_data = cursor.fetchall()
        conn.close()

        if len(all_data) < (24 * 7):
            print("Not enough local data for weekly humidity, fetching from historical API...")
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": latitude, "longitude": longitude,
                "daily": ["relative_humidity_2m_max", "relative_humidity_2m_min", "relative_humidity_2m_mean"],
                "timezone": "auto", "past_days": 7
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            api_data = response.json()
            
            return jsonify({
                "dates": api_data['daily']['time'],
                "maxHumidities": api_data['daily']['relative_humidity_2m_max'],
                "minHumidities": api_data['daily']['relative_humidity_2m_min'],
                "avgHumidities": api_data['daily']['relative_humidity_2m_mean']
            })
        
        df = pd.DataFrame([{'timestamp': standardize_timestamp(row['timestamp']), 'humidity': row['humidity']} for row in all_data])
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M')
        df['date'] = df['timestamp'].dt.strftime('%Y-%m-%d')
        
        grouped = df.groupby('date').agg({'humidity': ['min', 'max', 'mean']}).reset_index()
        grouped.columns = ['date', 'min_humidity', 'max_humidity', 'avg_humidity']

        return jsonify({
            "dates": grouped['date'].tolist(),
            "minHumidities": grouped['min_humidity'].tolist(),
            "maxHumidities": grouped['max_humidity'].tolist(),
            "avgHumidities": grouped['avg_humidity'].tolist()
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e), "dates": [], "minHumidities": [], "maxHumidities": [], "avgHumidities": []})