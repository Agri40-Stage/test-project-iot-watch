import pandas as pd
import traceback
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from db.connection import get_db_connection
from db.maintenance import generate_mock_data, DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from utils.time_formatter import standardize_timestamp

weekly_stats_bp = Blueprint('weekly_stats_bp', __name__)

@weekly_stats_bp.route('/weekly-stats', methods=['GET'])
def get_weekly_stats():
    """Get min, max, and average temperatures for the last 7 days"""
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
        
        if not all_data:
            generate_mock_data()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
            SELECT * FROM temperature_data
            WHERE latitude = ? AND longitude = ? AND timestamp >= ?
            ORDER BY timestamp ASC
            ''', (latitude, longitude, time_threshold))
            all_data = cursor.fetchall()
            conn.close()
        
        df = pd.DataFrame([{'timestamp': standardize_timestamp(row['timestamp']), 'temperature': row['temperature']} for row in all_data])
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M')
        df['date'] = df['timestamp'].dt.strftime('%Y-%m-%d')
        
        if len(df) > 0:
            grouped = df.groupby('date').agg({'temperature': ['min', 'max', 'mean']}).reset_index()
            grouped.columns = ['date', 'min_temp', 'max_temp', 'avg_temp']
            dates = grouped['date'].tolist()
            min_temps = grouped['min_temp'].tolist()
            max_temps = grouped['max_temp'].tolist()
            avg_temps = grouped['avg_temp'].tolist()
        else:
            dates, min_temps, max_temps, avg_temps = [], [], [], []

        return jsonify({"dates": dates, "minTemps": min_temps, "maxTemps": max_temps, "avgTemps": avg_temps})
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e), "dates": [], "minTemps": [], "maxTemps": [], "avgTemps": []})