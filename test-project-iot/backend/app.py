from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import numpy as np    
import threading
import time
import schedule
from functools import lru_cache

load_dotenv()
app = Flask(__name__)
CORS(app)

UPDATE_INTERVAL_SECONDS = 60
PREDICTION_UPDATE_HOURS = 24 
BASE_TEMP = 25.0 
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982
CACHE_DURATION = 600
last_prediction = None
last_prediction_time = None

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'temperature.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def generate_mock_data(clear_existing=True):
    """Generate mock temperature data for testing"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
    
    # Generate data for the last 7 days
    base_time = datetime.now() - timedelta(days=7)
    for i in range(168):  # 7 days * 24 hours
        timestamp = (base_time + timedelta(hours=i)).isoformat()
        # Generate temperature with some randomness around the base temperature
        temperature = BASE_TEMP + np.random.normal(0, 2)
        cursor.execute('''
        INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
        VALUES (?, ?, ?, ?)
        ''', (timestamp, temperature, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
    
    conn.commit()
    conn.close()
    print("Mock data generated successfully")

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_date TEXT NOT NULL,
        target_date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        UNIQUE(target_date, hour, latitude, longitude)
    )
    ''')
    
    # Create index for faster querying
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_target_date ON temperature_predictions(target_date)')
    
    conn.commit()
    
    cursor.execute('SELECT COUNT(*) FROM temperature_data')
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("Database is empty. Populating with mock data...")
        conn.close()
        generate_mock_data()
    else:
        conn.close()
        purge_old_data()

def purge_old_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_data
    WHERE timestamp < ?
    ''', (threshold_date,))
    
    # Delete predictions older than 5 days
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_predictions
    WHERE prediction_date < ?
    ''', (prediction_threshold,))
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

def get_current_temperature(update_db=True):
    """Get current temperature from Open-Meteo Forecast API and optionally update database"""
    try:
        # Open-Meteo Forecast API endpoint
        url = "https://api.open-meteo.com/v1/forecast"
        
        # Parameters to get current weather for Agadir
        params = {
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE,
            "current_weather": True
        }
        
        # Make GET request
        response = requests.get(url, params=params)
        
        if response.ok:
            data = response.json()
            
            if "current_weather" in data:
                # Get current temperature and timestamp
                current_temp = data["current_weather"]["temperature"]
                timestamp = data["current_weather"]["time"].replace('T', ' ')  # Remove T
                
                if update_db:
                    # Store in database
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    
                    cursor.execute('''
                    INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                    ''', (timestamp, current_temp, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    conn.commit()
                    conn.close()
                    print(f"[{timestamp}] Temperature updated: {current_temp:.2f}°C")
                
                return current_temp
            
        raise ValueError("Could not get current weather data")
            
    except Exception as e:
        print(f"Error getting current temperature: {str(e)}")
        raise

def update_current_temperature():
    """Update the database with the current temperature"""
    return get_current_temperature(update_db=True)

def update_all_predictions():
    """
    Update all predictions for the next 5 days.
    This completely refreshes the predictions table daily.
    """
    try:
        print(f"[{datetime.now().isoformat()}] Refreshing all temperature predictions for next 5 days...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Clear all existing predictions
        cursor.execute('DELETE FROM temperature_predictions')
        conn.commit()
        conn.close()
        
        print("Cleared all existing predictions")
        
        # Update predictions for each of the next 5 days
        prediction_count = 0
        for day in range(1, 6):
            try:
                result = predict_for_day(day)
                if "error" in result:
                    print(f"Error predicting day {day}: {result['error']}")
                else:
                    prediction_count += len(result.get("predictions", []))
            except Exception as e:
                print(f"Error predicting day {day}: {str(e)}")
                continue
        
        print(f"[{datetime.now().isoformat()}] Successfully generated {prediction_count} hourly predictions for next 5 days")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        return False

def run_background_services():
    """Run continuous temperature updates and scheduled prediction updates"""
    def temperature_updater():
        """Update temperature data continuously"""
        while True:
            update_current_temperature()
            get_current_temperature()
            time.sleep(UPDATE_INTERVAL_SECONDS)
    
    def scheduler():
        """Run scheduled tasks"""
        schedule.every().day.at("00:00").do(update_all_predictions)
        schedule.every().day.at("00:00").do(purge_old_data)        
        print("Performing initial prediction for all 5 days...")
        update_all_predictions()
        
        # Continue checking scheduled tasks
        while True:
            schedule.run_pending()
            time.sleep(1)
    
    # Start temperature updater in a background thread
    temp_thread = threading.Thread(target=temperature_updater)
    temp_thread.daemon = True
    temp_thread.start()
    print(f"Background temperature updates started (every {UPDATE_INTERVAL_SECONDS} seconds)")
    
    # Start scheduler in a background thread
    scheduler_thread = threading.Thread(target=scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    print(f"Prediction updates scheduled (daily at midnight)")
    
    print("All background services started successfully")

@app.route('/api/latest', methods=['GET'])
def get_latest_temperature():
    latitude = request.args.get('latitude', '30.4202')
    longitude = request.args.get('longitude', '-9.5982')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get the latest temperature
    cursor.execute('''
    SELECT * FROM temperature_data
    WHERE latitude = ? AND longitude = ?
    ORDER BY timestamp DESC
    LIMIT 1
    ''', (latitude, longitude))
    
    latest = cursor.fetchone()
    
    # Get previous temperature for trend calculation
    cursor.execute('''
    SELECT * FROM temperature_data
    WHERE latitude = ? AND longitude = ? AND timestamp < ?
    ORDER BY timestamp DESC
    LIMIT 1
    ''', (latitude, longitude, latest['timestamp'] if latest else ''))
    
    previous = cursor.fetchone()
    
    conn.close()
    
    if not latest:
        return jsonify({"error": "No temperature data available"})
    
    # Calculate trend
    trend = "stable"
    if previous:
        if latest['temperature'] > previous['temperature']:
            trend = "up"
        elif latest['temperature'] < previous['temperature']:
            trend = "down"
    
    # Ensure the temperature is returned with full precision
    temperature = float(latest['temperature'])
    
    return jsonify({
        "time": latest['timestamp'],
        "temperature": temperature,
        "trend": trend
    })

@app.route('/api/history', methods=['GET'])
def get_temperature_history():
    """Get the latest 10 temperature readings"""
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    hours = int(request.args.get('hours', '10'))
    
    conn = get_db_connection()
    cursor = conn.cursor()    
    time_threshold = (datetime.now() - timedelta(hours=hours)).isoformat()
    
    cursor.execute('''
    SELECT * FROM temperature_data
    WHERE latitude = ? AND longitude = ? AND timestamp >= ?
    ORDER BY timestamp DESC
    LIMIT 10
    ''', (latitude, longitude, time_threshold))
    
    history = cursor.fetchall()
    conn.close()
    
    if not history:
        update_current_temperature()
        
        # Try fetching again
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
        SELECT * FROM temperature_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ?
        ORDER BY timestamp DESC
        LIMIT 10
        ''', (latitude, longitude, time_threshold))
        
        history = cursor.fetchall()
        conn.close()
    
    history = history[::-1]
    
    timestamps = [record['timestamp'] for record in history]
    temperatures = [record['temperature'] for record in history]
    
    print(f"[{datetime.now().isoformat()}] Returning {len(history)} temperature readings")
    
    return jsonify({
        "lastTimestamps": timestamps,
        "lastTemperatures": temperatures,
        "updateInterval": UPDATE_INTERVAL_SECONDS,
        "count": len(history)
    })

@app.route('/api/weekly-stats', methods=['GET'])
def get_weekly_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get the last 7 days of data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Récupérer les données groupées par jour
        cursor.execute('''
        SELECT 
            date(timestamp) as date,
            MIN(temperature) as min_temp,
            MAX(temperature) as max_temp,
            AVG(temperature) as avg_temp
        FROM temperature_data
        WHERE timestamp >= ?
        GROUP BY date(timestamp)
        ORDER BY date ASC
        ''', (start_date.isoformat(),))
        
        data = cursor.fetchall()
        conn.close()
        
        if not data:
            # Si pas de données, générer des données mock
            generate_mock_data()            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
            SELECT 
                date(timestamp) as date,
                MIN(temperature) as min_temp,
                MAX(temperature) as max_temp,
                AVG(temperature) as avg_temp
            FROM temperature_data
            WHERE timestamp >= ?
            GROUP BY date(timestamp)
            ORDER BY date ASC
            ''', (start_date.isoformat(),))
            
            data = cursor.fetchall()
            conn.close()
        
        # Préparer les données pour le graphique
        dates = []
        min_temps = []
        max_temps = []
        avg_temps = []
        
        for row in data:
            dates.append(row['date'])
            min_temps.append(float(row['min_temp']))
            max_temps.append(float(row['max_temp']))
            avg_temps.append(float(row['avg_temp']))
        
        return jsonify({
            "dates": dates,
            "minTemps": min_temps,
            "maxTemps": max_temps,
            "avgTemps": avg_temps
        })
        
    except Exception as e:
        print(f"Error in get_weekly_stats: {str(e)}")
        return jsonify({
            "error": str(e),
            "dates": [],
            "minTemps": [],
            "maxTemps": [],
            "avgTemps": []
        }), 500

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
            # If no predictions found, generate them
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

def load_prediction_model():
    """Load the Keras prediction model (cached version)"""
    
    # Define possible model paths
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    possible_paths = [
        os.path.join(model_dir, 'ml.keras'),
        os.path.join(os.path.dirname(__file__), 'ml.keras')
    ]
    
    print(f"Attempting to load model from possible paths:")
    for path in possible_paths:
        print(f"Checking path: {path}")
        print(f"Path exists: {os.path.exists(path)}")
    
    # Try each possible path
    for model_path in possible_paths:
        try:
            if os.path.exists(model_path):
                print(f"Loading model from: {model_path}")
                model = load_model(model_path, compile=False)
                print(f"Successfully loaded Keras model from {model_path} (cached)")
                return model
            else:
                print(f"Model file not found at: {model_path}")
        except Exception as e:
            print(f"Error loading model from {model_path}:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    raise ValueError("Could not load the prediction model from any of the specified paths")

def predict_for_day(day):
    """Generate temperature predictions and store in database"""
    try:
        model = load_prediction_model()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Calculate start time for tomorrow (day 1) or subsequent days
            tomorrow = datetime.now() + timedelta(days=1)
            start_time = tomorrow + timedelta(days=day-1)
            start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(days=1)
            
            # Clear existing predictions for this day
            cursor.execute('''
            DELETE FROM temperature_predictions 
            WHERE target_date >= ? AND target_date < ?
            ''', (start_time.isoformat(), end_time.isoformat()))
            
            # Get historical data
            cursor.execute('''
            SELECT timestamp, temperature FROM temperature_data
            ORDER BY timestamp DESC
            LIMIT 100  -- Get more historical data for better predictions
            ''')
            
            history = cursor.fetchall()
            if not history:
                raise ValueError("No historical data available")
            
            # Extract temperatures and convert to numpy array
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
            
            for hour in range(24):
                timestamp = start_time + timedelta(hours=hour)                
                hour_factor = np.cos(2 * np.pi * ((hour - 14) / 24))
                daily_variation = 3.0 * hour_factor
                noise = np.random.normal(0, 0.2)
                temperature = base_temp + daily_variation + seasonal_factor + noise
                
                try:
                    cursor.execute('''
                    INSERT OR REPLACE INTO temperature_predictions 
                    (prediction_date, target_date, hour, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''', (datetime.now().isoformat(), timestamp.isoformat(), hour, temperature, 
                         DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    
                    hourly_predictions.append(float(temperature))
                    timestamps.append(timestamp.isoformat())
                    
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print(f"Database locked, skipping hour {hour}")
                        continue
                    raise
            
            # Commit all predictions
            try:
                conn.commit()
                print(f"Successfully stored {len(hourly_predictions)} hourly predictions for day {day}")
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e):
                    print("Database locked, could not commit predictions")
                else:
                    raise
            
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
            print(f"Error making predictions with model: {str(e)}")
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
                
                # Sort hourly predictions by hour
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
        
        # Get last update time
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

if __name__ == '__main__':
    run_background_services()    
    app.run(debug=True, port=int(os.environ.get('PORT', 5000)))