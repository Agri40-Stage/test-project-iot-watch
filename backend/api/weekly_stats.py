import pandas as pd
import traceback
import requests
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from utils.time_formatter import standardize_timestamp

weekly_stats_bp = Blueprint('weekly_stats_bp', __name__)

@weekly_stats_bp.route('/weekly-stats', methods=['GET'])
def get_weekly_stats():
    """Get min, max, and average temperatures for the last 7 days from DB, with API fallback."""
    try:
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        time_threshold = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
        
        cursor.execute('''
        SELECT * FROM temperature_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ?
        ORDER BY timestamp ASC
        ''', (latitude, longitude, time_threshold))
        
        all_data = cursor.fetchall()
        conn.close()
        
        if len(all_data) < (24 * 7):
            print("Not enough local data for weekly stats, fetching from historical API...")
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": latitude, "longitude": longitude,
                "daily": ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean"],
                "timezone": "auto", "past_days": 7
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            api_data = response.json()
            
            return jsonify({
                "dates": api_data['daily']['time'],
                "maxTemps": api_data['daily']['temperature_2m_max'],
                "minTemps": api_data['daily']['temperature_2m_min'],
                "avgTemps": api_data['daily']['temperature_2m_mean']
            })

        df = pd.DataFrame([{'timestamp': standardize_timestamp(row['timestamp']), 'temperature': row['temperature']} for row in all_data])
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M')
        df['date'] = df['timestamp'].dt.strftime('%Y-%m-%d')
        
        grouped = df.groupby('date').agg({'temperature': ['min', 'max', 'mean']}).reset_index()
        grouped.columns = ['date', 'min_temp', 'max_temp', 'avg_temp']
        
        return jsonify({
            "dates": grouped['date'].tolist(),
            "minTemps": grouped['min_temp'].tolist(),
            "maxTemps": grouped['max_temp'].tolist(),
            "avgTemps": grouped['avg_temp'].tolist()
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e), "dates": [], "minTemps": [], "maxTemps": [], "avgTemps": []})