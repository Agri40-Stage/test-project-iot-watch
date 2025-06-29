"""
IoT Temperature Watch - Flask Backend Application
================================================

This Flask application serves as the backend for the IoT temperature monitoring system.
It provides REST API endpoints for temperature data, manages background services for
data collection, and handles machine learning predictions.

Key Features:
- Real-time temperature data collection from Open-Meteo API
- SQLite database storage and management
- Machine learning temperature predictions
- Background services for continuous data updates
- RESTful API endpoints for frontend consumption
"""

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

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application with CORS support
app = Flask(__name__)

# Enhanced CORS configuration for better frontend-backend communication
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)

# Configuration constants
UPDATE_INTERVAL_SECONDS = 60  # Interval for temperature updates
PREDICTION_UPDATE_HOURS = 24  # How often to update predictions
CACHE_DURATION = 600  # Cache duration in seconds
last_prediction = None  # Cache for last prediction result
last_prediction_time = None  # Timestamp of last prediction

# Initialize database tables and populate with initial data
init_db()

def run_background_services():
    """
    Start background services for continuous data collection and processing.
    
    This function initializes two main background threads:
    1. Temperature updater - continuously fetches and stores temperature data
    2. Scheduler - handles daily prediction updates and data cleanup
    """
    
    def temperature_updater():
        """
        Background thread for continuous temperature data collection.
        
        This function runs in an infinite loop, fetching current temperature
        from the Open-Meteo API every second and storing it in the database.
        """
        while True:
            try:
                get_current_temperature()
                time.sleep(1)  # Wait 1 second between updates
            except Exception as e:
                print(f"Error in temperature updater: {str(e)}")
                time.sleep(1)  # Continue even if there's an error
    
    def scheduler():
        """
        Background thread for scheduled tasks.
        
        This function handles:
        - Daily prediction updates at midnight
        - Daily data cleanup (removing old records)
        - Initial prediction generation on startup
        """
        # Schedule daily tasks at midnight
        schedule.every().day.at("00:00").do(update_all_predictions)
        schedule.every().day.at("00:00").do(purge_old_data)
        
        print("Performing initial prediction for all 5 days...")
        update_all_predictions()  # Generate initial predictions
        
        # Main scheduler loop
        while True:
            try:
                schedule.run_pending()  # Execute any pending scheduled tasks
                time.sleep(1)
            except Exception as e:
                print(f"Error in scheduler: {str(e)}")
                time.sleep(1)
    
    # Start temperature updater in a background thread
    temp_thread = threading.Thread(target=temperature_updater)
    temp_thread.daemon = True  # Thread will terminate when main program exits
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
    """
    Get the latest temperature reading and current hour's average.
    
    This endpoint returns:
    - Most recent temperature reading
    - Current hour's average temperature
    - Temperature trend (up/down/stable)
    - Number of readings in current hour
    
    Query Parameters:
    - latitude: Location latitude (default: Agadir, Morocco)
    - longitude: Location longitude (default: Agadir, Morocco)
    
    Returns:
    - JSON object with temperature data and metadata
    """
    # Get location parameters from request, use defaults if not provided
    latitude = request.args.get('latitude', DEFAULT_LATITUDE)
    longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get the most recent temperature reading for the specified location
        cursor.execute('''
        SELECT * FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        
        latest = cursor.fetchone()
        
        # If no data exists, fetch current temperature and return it
        if not latest:
            current_temp = get_current_temperature()
            return jsonify({
                "time": datetime.now().isoformat(),
                "temperature": current_temp,
                "trend": "stable",
                "is_live": True
            })
        
        # Calculate current hour's average temperature
        current_hour = datetime.now().strftime('%Y-%m-%d %H')
        cursor.execute('''
        SELECT AVG(temperature) as avg_temp, COUNT(*) as count
        FROM temperature_data
        WHERE strftime('%Y-%m-%d %H', timestamp) = ?
        AND latitude = ? AND longitude = ?
        ''', (current_hour, latitude, longitude))
        
        hour_stats = cursor.fetchone()
        
        # Get previous hour's average for trend calculation
        prev_hour = (datetime.now() - timedelta(hours=1)).strftime('%Y-%m-%d %H')
        cursor.execute('''
        SELECT AVG(temperature) as avg_temp
        FROM temperature_data
        WHERE strftime('%Y-%m-%d %H', timestamp) = ?
        AND latitude = ? AND longitude = ?
        ''', (prev_hour, latitude, longitude))
        
        prev_hour_avg = cursor.fetchone()
        
        # Determine temperature trend by comparing current vs previous hour
        trend = "stable"
        if prev_hour_avg and hour_stats:
            if hour_stats['avg_temp'] > prev_hour_avg['avg_temp']:
                trend = "up"
            elif hour_stats['avg_temp'] < prev_hour_avg['avg_temp']:
                trend = "down"
        
        # Return comprehensive temperature data
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
    """
    Get the last 10 individual temperature readings.
    
    This endpoint returns historical temperature data for charting and analysis.
    If no data exists, it triggers a temperature fetch to populate the database.
    
    Query Parameters:
    - latitude: Location latitude (default: Agadir, Morocco)
    - longitude: Location longitude (default: Agadir, Morocco)
    
    Returns:
    - JSON object with timestamps and temperatures in chronological order
    """
    # Get location parameters from request
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
        
        # If no data exists, fetch current temperature and try again
        if not readings:
            get_current_temperature()

            # Try fetching again after populating the database
            cursor.execute('''
            SELECT timestamp, temperature
            FROM temperature_data
            WHERE latitude = ? AND longitude = ?
            ORDER BY timestamp DESC
            LIMIT 10
            ''', (latitude, longitude))
            
            readings = cursor.fetchall()
        
        # Convert to lists in chronological order (oldest first)
        readings = readings[::-1]  # Reverse to get chronological order
        
        timestamps = [record['timestamp'] for record in readings]
        temperatures = [float(record['temperature']) for record in readings]
        
        print(f"[{datetime.now().isoformat()}] Returning {len(readings)} temperature readings")
        
        return jsonify({
            "lastTimestamps": timestamps,
            "lastTemperatures": temperatures,
            "updateInterval": 1,  # Update interval in seconds
            "count": len(readings),
            "isHourlyAverage": False  # Indicates these are individual readings, not averages
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
def get_weather_forecast():
    """
    Get weather forecast for multiple days.
    
    This endpoint fetches weather forecast data from Open-Meteo API for up to 7 days.
    
    Query Parameters:
    - days: Number of days to forecast (1-7, default: 7)
    - latitude: Location latitude (default: Agadir, Morocco)
    - longitude: Location longitude (default: Agadir, Morocco)
    
    Returns:
    - JSON object with hourly forecast data for specified days
    """
    try:
        from services.weather_fetcher import get_weather_forecast
        
        # Get query parameters
        days = request.args.get('days', 7, type=int)
        days = max(1, min(days, 7))  # Ensure days is between 1 and 7
        
        # Get forecast data
        forecast_data = get_weather_forecast(days)
        
        return jsonify({
            "forecast_days": days,
            "location": {
                "latitude": DEFAULT_LATITUDE,
                "longitude": DEFAULT_LONGITUDE,
                "city": "Agadir, Morocco"
            },
            "data": forecast_data
        })
        
    except Exception as e:
        print(f"Error getting weather forecast: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/insert-mock-data', methods=['POST'])
def insert_mock_data():
    """Insert mock temperature data for testing predictions"""
    try:
        from models import generate_mock_data
        generate_mock_data(clear_existing=True)
        return jsonify({"success": True, "message": "Mock data inserted successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/weather', methods=['GET'])
def get_comprehensive_weather():
    """
    Get comprehensive weather data including temperature, humidity, wind, etc.
    
    This endpoint fetches real-time weather data from Open-Meteo API including:
    - Current temperature
    - Relative humidity
    - Wind speed and direction
    - Precipitation probability
    - Weather conditions
    
    Query Parameters:
    - latitude: Location latitude (default: Agadir, Morocco)
    - longitude: Location longitude (default: Agadir, Morocco)
    
    Returns:
    - JSON object with comprehensive weather data
    """
    try:
        from services.weather_fetcher import get_current_weather
        
        # Get comprehensive weather data
        weather_data = get_current_weather()
        
        # Get weather condition description based on weather code
        weather_conditions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        
        weather_description = weather_conditions.get(weather_data.get("weather_code", 0), "Unknown")
        
        return jsonify({
            "timestamp": weather_data["timestamp"],
            "temperature": weather_data["temperature"],
            "humidity": weather_data["humidity"],
            "wind_speed": weather_data["wind_speed"],
            "wind_direction": weather_data["wind_direction"],
            "precipitation_probability": weather_data["precipitation_probability"],
            "weather_code": weather_data["weather_code"],
            "weather_description": weather_description,
            "location": {
                "latitude": DEFAULT_LATITUDE,
                "longitude": DEFAULT_LONGITUDE,
                "city": "Agadir, Morocco"
            },
            "units": {
                "temperature": "°C",
                "humidity": "%",
                "wind_speed": "km/h",
                "wind_direction": "degrees",
                "precipitation_probability": "%"
            }
        })
        
    except Exception as e:
        print(f"Error getting comprehensive weather: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    """
    Get comprehensive AI insights including predictions, anomaly detection, and pattern analysis.
    
    This endpoint provides advanced AI analysis of weather data including:
    - Smart temperature predictions using ML models
    - Anomaly detection for unusual patterns
    - Weather pattern classification
    - Actionable recommendations
    
    Returns:
    - JSON object with comprehensive AI insights
    """
    try:
        from services.ai_analyzer import ai_analyzer
        from services.weather_fetcher import get_current_weather
        
        # Get current weather data
        current_weather = get_current_weather()
        
        # Get recent historical data for analysis
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT timestamp, temperature
        FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 50
        ''', (DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
        
        historical_data = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Generate AI insights
        insights = ai_analyzer.get_ai_insights(current_weather, historical_data)
        
        return jsonify(insights)
        
    except Exception as e:
        print(f"Error getting AI insights: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/ai/predict', methods=['GET'])
def ai_temperature_prediction():
    """
    Get AI-powered temperature prediction for a specific time.
    
    Query Parameters:
    - hours: Hours from now to predict (default: 24)
    - days: Days from now to predict (default: 1)
    
    Returns:
    - JSON object with AI prediction and confidence
    """
    try:
        from services.ai_analyzer import ai_analyzer
        
        # Get prediction parameters
        hours = request.args.get('hours', 24, type=int)
        days = request.args.get('days', 1, type=int)
        
        # Calculate target datetime
        target_datetime = datetime.now() + timedelta(hours=hours, days=days-1)
        
        # Get AI prediction
        prediction = ai_analyzer.predict_temperature_ai(target_datetime)
        
        if prediction:
            return jsonify({
                'target_datetime': target_datetime.isoformat(),
                'prediction': prediction,
                'model_info': {
                    'type': 'RandomForest',
                    'features': ['hour', 'day_of_week', 'month'],
                    'training_data_size': '1000+ samples'
                }
            })
        else:
            return jsonify({"error": "Failed to generate prediction"})
            
    except Exception as e:
        print(f"Error in AI temperature prediction: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/ai/anomalies', methods=['GET'])
def detect_anomalies():
    """
    Detect anomalies in recent temperature data.
    
    Query Parameters:
    - hours: Number of hours to analyze (default: 24)
    
    Returns:
    - JSON object with anomaly detection results
    """
    try:
        from services.ai_analyzer import ai_analyzer
        
        hours = request.args.get('hours', 24, type=int)
        
        # Get recent temperature data
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT temperature
        FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        AND timestamp >= datetime('now', '-{} hours')
        ORDER BY timestamp DESC
        ''', (DEFAULT_LATITUDE, DEFAULT_LONGITUDE, hours))
        
        temperature_data = [row['temperature'] for row in cursor.fetchall()]
        conn.close()
        
        # Detect anomalies
        anomaly_results = ai_analyzer.detect_anomalies(temperature_data)
        
        return jsonify({
            'analysis_period_hours': hours,
            'total_readings': len(temperature_data),
            'anomaly_detection': anomaly_results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in anomaly detection: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/iot/devices', methods=['GET'])
def get_iot_devices():
    """
    Get status of all IoT devices and sensors.
    
    Returns:
    - JSON object with device status and health metrics
    """
    try:
        from services.iot_simulator import iot_simulator
        
        # Start simulation if not running
        if not iot_simulator.simulation_running:
            iot_simulator.start_simulation()
        
        return jsonify(iot_simulator.get_all_sensors_status())
        
    except Exception as e:
        print(f"Error getting IoT devices: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/iot/health', methods=['GET'])
def get_iot_health():
    """
    Get overall IoT device health summary.
    
    Returns:
    - JSON object with health scores and alerts
    """
    try:
        from services.iot_simulator import iot_simulator
        
        return jsonify(iot_simulator.get_device_health_summary())
        
    except Exception as e:
        print(f"Error getting IoT health: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/iot/sensor/<sensor_id>', methods=['GET'])
def get_sensor_reading(sensor_id):
    """
    Get reading from a specific IoT sensor.
    
    Args:
    - sensor_id: ID of the sensor to read
        
    Returns:
    - JSON object with sensor reading and metadata
    """
    try:
        from services.iot_simulator import iot_simulator
        from services.weather_fetcher import get_current_weather
        
        # Get current temperature as base
        current_weather = get_current_weather()
        base_temperature = current_weather['temperature']
        
        # Get sensor reading
        reading = iot_simulator.get_sensor_reading(sensor_id, base_temperature)
        
        if reading:
            return jsonify(reading)
        else:
            return jsonify({"error": f"Sensor {sensor_id} not found"}), 404
            
    except Exception as e:
        print(f"Error getting sensor reading: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/ai/pattern', methods=['GET'])
def classify_weather_pattern():
    """
    Classify current weather pattern using AI.
    
    Returns:
    - JSON object with pattern classification results
    """
    try:
        from services.ai_analyzer import ai_analyzer
        from services.weather_fetcher import get_current_weather
        
        # Get current weather data
        current_weather = get_current_weather()
        
        # Classify pattern
        pattern_results = ai_analyzer.classify_weather_pattern(current_weather)
        
        return jsonify({
            'current_weather': current_weather,
            'pattern_classification': pattern_results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in pattern classification: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/test-cors', methods=['GET', 'POST', 'OPTIONS'])
def test_cors():
    """Test endpoint to verify CORS configuration"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'preflight ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    return jsonify({
        'status': 'success',
        'message': 'CORS is working!',
        'method': request.method,
        'timestamp': datetime.now().isoformat(),
        'headers': dict(request.headers)
    })

@app.route('/api/<path:subpath>', methods=['OPTIONS'])
def handle_options(subpath):
    """Handle OPTIONS requests for CORS preflight"""
    response = jsonify({'status': 'ok'})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.after_request
def add_header(response):
    """Add headers to prevent caching for real-time data and ensure CORS compatibility"""
    # Add CORS headers for all responses
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    # Add cache control headers for API endpoints
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