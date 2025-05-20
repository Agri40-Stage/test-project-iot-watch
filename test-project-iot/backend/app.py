import os
import time
import threading
import sqlite3
import schedule
import numpy as np
import pandas as pd
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from flask import Flask, jsonify, request, send_from_directory
from services.weather_fetcher import *
from models import *

load_dotenv()
app = Flask(__name__)
CORS(app)

UPDATE_INTERVAL_SECONDS = 60
PREDICTION_UPDATE_HOURS = 24
CACHE_DURATION = 600
last_prediction = None
last_prediction_time = None


# Initialize database
init_db()

def run_background_services():
    def temperature_updater():
        """Update temperature data continuously"""
        while True:
            try:
                get_current_temperature()
                time.sleep(1)
            except Exception as e:
                print(f"Error in temperature updater: {str(e)}")
                time.sleep(1)
    
    def scheduler():
        schedule.every().day.at("00:00").do(update_all_predictions)
        schedule.every().day.at("00:00").do(purge_old_data)
        
        print("Performing initial prediction for all 5 days...")
        update_all_predictions()        
        while True:
            try:
                schedule.run_pending()
                time.sleep(1)
            except Exception as e:
                print(f"Error in scheduler: {str(e)}")
                time.sleep(1)
    
    # Start temperature updater in a background thread
    temp_thread = threading.Thread(target=temperature_updater)
    temp_thread.daemon = True
    temp_thread.start()
    print("Background temperature updates started (every second)")
  
    # Start scheduler in a background thread
    scheduler_thread = threading.Thread(target=scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    print(f"Prediction updates scheduled (daily at midnight)")
    
    print("All background services started successfully")

@app.route('/api/latest', methods=['GET'])
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
        
        # Get current hour's average
        current_hour = datetime.now().strftime('%Y-%m-%d %H')
        cursor.execute('''
        SELECT AVG(temperature) as avg_temp, COUNT(*) as count
        FROM temperature_data
        WHERE strftime('%Y-%m-%d %H', timestamp) = ?
        AND latitude = ? AND longitude = ?
        ''', (current_hour, latitude, longitude))
        
        hour_stats = cursor.fetchone()        
        prev_hour = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%d %H')
        cursor.execute('''
        SELECT AVG(temperature) as avg_temp
        FROM temperature_data
        WHERE strftime('%Y-%m-%d %H', timestamp) = ?
        AND latitude = ? AND longitude = ?
        ''', (prev_hour, latitude, longitude))
        
        prev_hour_avg = cursor.fetchone()
        
        # Calculate trend
        trend = "stable"
        if prev_hour_avg and hour_stats:
            if hour_stats['avg_temp'] > prev_hour_avg['avg_temp']:
                trend = "up"
            elif hour_stats['avg_temp'] < prev_hour_avg['avg_temp']:
                trend = "down"
        
        return jsonify({
            "time": latest['timestamp'],
            "temperature": float(latest['temperature']),
            "current_hour_avg": float(hour_stats['avg_temp']) if hour_stats else None,
            "readings_this_hour": hour_stats['count'] if hour_stats else 0,
            "trend": trend,
            "is_live": True
        })
        
    except Exception as e:
        print(f"Error getting latest temperature: {str(e)}")
        return jsonify({"error": str(e)})
    finally:
        conn.close()

@app.route('/api/history', methods=['GET'])
def get_temperature_history():
    """Get the last 10 individual temperature readings"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get the last 10 individual temperature readings
        cursor.execute('''
        SELECT timestamp, temperature
        FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 10
        ''', (latitude, longitude))
        readings = cursor.fetchall()
        if not readings:
            get_current_temperature()

            # Try fetching again
            cursor.execute('''
            SELECT timestamp, temperature
            FROM temperature_data
            WHERE latitude = ? AND longitude = ?
            ORDER BY timestamp DESC
            LIMIT 10
            ''', (latitude, longitude))
            
            readings = cursor.fetchall()
        
        # Convert to lists in chronological order
        readings = readings[::-1]  # Reverse to get chronological order
        
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

@app.route('/api/weekly-stats', methods=['GET'])
def get_weekly_stats():
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
        
        # Convert to DataFrame with standardized timestamps
        df = pd.DataFrame([{
            'timestamp': standardize_timestamp(row['timestamp']),
            'temperature': row['temperature']
        } for row in all_data])
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='%Y-%m-%d %H:%M')
        df['date'] = df['timestamp'].dt.strftime('%Y-%m-%d')
        
        if len(df) > 0:
            grouped = df.groupby('date').agg({
                'temperature': ['min', 'max', 'mean']
            }).reset_index()
            grouped.columns = ['date', 'min_temp', 'max_temp', 'avg_temp']
            dates = grouped['date'].tolist()
            min_temps = grouped['min_temp'].tolist()
            max_temps = grouped['max_temp'].tolist()
            avg_temps = grouped['avg_temp'].tolist()
        else:
            dates = []
            min_temps = []
            max_temps = []
            avg_temps = []

        return jsonify({
            "dates": dates,
            "minTemps": min_temps,
            "maxTemps": max_temps,
            "avgTemps": avg_temps
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "dates": [],
            "minTemps": [],
            "maxTemps": [],
            "avgTemps": []
        })

@app.route('/api/predict', methods=['GET'])
def predict_temperature():
    """Get temperature predictions from database"""
    try:
        day = int(request.args.get('day', '1'))
        if day < 1 or day > 5:
            return jsonify({"error": "Day parameter must be between 1 and 5"})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate the date range starting from tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow + timedelta(days=day-1)
        start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(days=1)
        
        # Get predictions from database
        cursor.execute('''
        SELECT * FROM temperature_predictions
        WHERE target_date >= ? AND target_date < ?
        ORDER BY hour ASC
        ''', (start_time.isoformat(), end_time.isoformat()))
        
        predictions = cursor.fetchall()
        conn.close()
        
        if not predictions:
            print(f"No predictions found for day {day}, generating new predictions...")
            result = predict_for_day(day)
            return jsonify(result)
        
        # Format the predictions
        hourly_predictions = []
        timestamps = []
        temperatures = []
        
        for pred in predictions:
            target_time = datetime.fromisoformat(pred['target_date'])
            hourly_predictions.append({
                "hour": pred['hour'],
                "time": target_time.strftime("%H:00"),
                "temperature": pred['temperature']
            })
            timestamps.append(pred['target_date'])
            temperatures.append(pred['temperature'])
        
        return jsonify({
            "day": day,
            "date": start_time.strftime("%Y-%m-%d"),
            "day_of_week": start_time.strftime("%A"),
            "timestamps": timestamps,
            "predictions": [p["temperature"] for p in hourly_predictions],
            "hourly": hourly_predictions,
            "min_temp": min(temperatures) if temperatures else None,
            "max_temp": max(temperatures) if temperatures else None,
            "avg_temp": sum(temperatures) / len(temperatures) if temperatures else None
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)})

def predict_for_day(day):
    """Generate temperature predictions for a specific day and store in database"""
    try:
        model = load_prediction_model()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            tomorrow = datetime.now() + timedelta(days=1)
            start_time = tomorrow + timedelta(days=day-1)
            start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(days=1)
            
            # Get historical data for better predictions
            cursor.execute('''
            SELECT timestamp, temperature FROM temperature_data
            ORDER BY timestamp DESC
            LIMIT 168  -- Get last 7 days of hourly data
            ''')
            
            history = cursor.fetchall()
            if not history:
                raise ValueError("No historical data available for predictions")
            
            historical_temps = np.array([record[1] for record in history], dtype=np.float32)            
            scaler = MinMaxScaler(feature_range=(-1, 1))
            data_scaled = scaler.fit_transform(historical_temps.reshape(-1, 1))
            
            # Ensure we have enough data or pad if necessary
            if len(data_scaled) < 30:
                pad_amount = 30 - len(data_scaled)
                data_scaled = np.pad(data_scaled, ((pad_amount, 0), (0, 0)), mode='wrap')
            
            # Prepare sequence for prediction
            sequence = data_scaled[-30:].reshape(1, 30, 1)            
            predictions = model.predict(sequence, verbose=0)
            base_temp = float(scaler.inverse_transform(predictions)[0][0])
            
            hourly_predictions = []
            timestamps = []
            
            # Add seasonal and daily variations
            day_of_year = start_time.timetuple().tm_yday
            seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 3.0
            
            # Generate predictions for each hour
            for hour in range(24):
                timestamp = start_time + timedelta(hours=hour)
                hour_factor = np.cos(2 * np.pi * ((hour - 14) / 24))
                daily_variation = 3.0 * hour_factor
                noise = np.random.normal(0, 0.2)
                temperature = base_temp + daily_variation + seasonal_factor + noise
                
                try:
                    cursor.execute('''
                    INSERT INTO temperature_predictions 
                    (prediction_date, target_date, hour, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''', (datetime.now().isoformat(), timestamp.isoformat(), hour, temperature, 
                         DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    hourly_predictions.append(float(temperature))
                    timestamps.append(timestamp.isoformat())
                    
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print(f"Database locked, retrying hour {hour}")
                        time.sleep(0.1)
                        continue
                    raise
            
            # Commit all predictions
            conn.commit()
            print(f"Successfully stored {len(hourly_predictions)} hourly predictions for day {day}")
            
            return {
                "day": day,
                "date": start_time.strftime("%Y-%m-%d"),
                "day_of_week": start_time.strftime("%A"),
                "timestamps": timestamps,
                "predictions": hourly_predictions,
                "min_temp": min(hourly_predictions) if hourly_predictions else None,
                "max_temp": max(hourly_predictions) if hourly_predictions else None,
                "avg_temp": sum(hourly_predictions) / len(hourly_predictions) if hourly_predictions else None
            }
            
        except Exception as e:
            print(f"Error making predictions for day {day}: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Error in predict_for_day: {str(e)}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    Get a comprehensive 5-day hourly forecast.
    Returns all hourly predictions for the next 5 days.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        current_datetime = datetime.now().isoformat()
        
        cursor.execute('''
        SELECT * FROM temperature_predictions
        WHERE target_date >= ?
        ORDER BY target_date ASC, hour ASC
        ''', (current_datetime,))
        
        all_predictions = cursor.fetchall()
        conn.close()
        
        if not all_predictions:
            # If no predictions available, try to generate them
            print("No predictions found. Generating new predictions.")
            update_all_predictions()
            
            # Then try fetching again
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
            SELECT * FROM temperature_predictions
            WHERE target_date >= ?
            ORDER BY target_date ASC, hour ASC
            ''', (current_datetime,))
            
            all_predictions = cursor.fetchall()
            conn.close()
            
            if not all_predictions:
                return jsonify({
                    "success": False,
                    "message": "No forecast data available",
                    "days": []
                })
        
        today_midnight = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Prepare the 5-day forecast
        forecast = []
        for i in range(1, 6):
            day_start = today_midnight + timedelta(days=i-1)
            day_end = day_start + timedelta(days=1)
            
            # Filter predictions for this day
            day_predictions = [dict(p) for p in all_predictions 
                              if day_start.isoformat() <= p['target_date'] < day_end.isoformat()]
            
            if day_predictions:
                temperatures = [p['temperature'] for p in day_predictions]
                day_date = datetime.fromisoformat(day_predictions[0]['target_date']).replace(hour=0)                
                hourly = []
                for p in day_predictions:
                    target_time = datetime.fromisoformat(p['target_date'])
                    hourly.append({
                        "hour": p['hour'],
                        "time": target_time.strftime("%H:00"),
                        "temperature": p['temperature'],
                        "timestamp": p['target_date']
                    })                
                hourly.sort(key=lambda x: x['hour'])
                
                # Add day to forecast
                forecast.append({
                    "day_number": i,
                    "date": day_date.strftime("%Y-%m-%d"),
                    "day_of_week": day_date.strftime("%A"),
                    "min_temp": min(temperatures) if temperatures else None,
                    "max_temp": max(temperatures) if temperatures else None,
                    "avg_temp": sum(temperatures) / len(temperatures) if temperatures else None,
                    "prediction_count": len(hourly),
                    "hourly": hourly
                })
        
        forecast.sort(key=lambda x: x['day_number'])        
        if all_predictions:
            last_prediction_date = max([datetime.fromisoformat(p['prediction_date']) for p in all_predictions])
            next_update = last_prediction_date + timedelta(days=1)
        else:
            last_prediction_date = None
            next_update = datetime.now() + timedelta(days=1)
        
        return jsonify({
            "success": True,
            "days": len(forecast),
            "last_updated": last_prediction_date.isoformat() if last_prediction_date else None,
            "next_update": next_update.isoformat(),
            "update_frequency": "daily",
            "forecast": forecast
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.after_request
def add_header(response):
    """Add headers to prevent caching for real-time data"""
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
    return response
    
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve React app files from frontend/ReactApp directory"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'ReactApp', 'dist')
    
    if path and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    else:
        return send_from_directory(static_dir, 'index.html')

if __name__ == "__main__":
    run_background_services()
    app.run(host="0.0.0.0", port=5000)