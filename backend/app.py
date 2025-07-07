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
from services.gemini_service import analyze_crop_weather, get_crop_suggestions
from models import *

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"], supports_credentials=True)

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

@app.route('/api/crop/analyze', methods=['GET'])
def analyze_crop():
    """Analyze weather impact on a specific crop using AI"""
    try:
        crop_name = request.args.get('crop', '').strip()
        if not crop_name:
            return jsonify({"error": "Crop name is required"}), 400
        
        # Get current weather data
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get latest comprehensive weather data
        cursor.execute('''
        SELECT * FROM weather_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        
        weather_data = cursor.fetchone()
        
        if weather_data:
            current_temperature = float(weather_data['temperature'])
            humidity = float(weather_data['humidity']) if weather_data['humidity'] else None
            precipitation = float(weather_data['precipitation']) if weather_data['precipitation'] else None
            wind_speed = float(weather_data['wind_speed']) if weather_data['wind_speed'] else None
            uv_index = float(weather_data['uv_index']) if weather_data['uv_index'] else None
            pressure = float(weather_data['pressure']) if weather_data['pressure'] else None
            cloud_cover = float(weather_data['cloud_cover']) if weather_data['cloud_cover'] else None
        else:
            # Fallback to basic temperature data
            cursor.execute('''
            SELECT temperature FROM temperature_data
            WHERE latitude = ? AND longitude = ?
            ORDER BY timestamp DESC
            LIMIT 1
            ''', (latitude, longitude))
            
            latest_temp = cursor.fetchone()
            current_temperature = float(latest_temp['temperature']) if latest_temp else 25.0
            humidity = None
            precipitation = None
            wind_speed = None
            uv_index = None
            pressure = None
            cloud_cover = None
        
        # Determine weather condition based on data
        weather_condition = "Clear"
        if precipitation and precipitation > 0:
            weather_condition = "Rainy"
        elif cloud_cover and cloud_cover > 70:
            weather_condition = "Cloudy"
        elif wind_speed and wind_speed > 20:
            weather_condition = "Windy"
        
        # Analyze crop with AI using comprehensive weather data
        analysis = analyze_crop_weather(
            crop_name=crop_name,
            temperature=current_temperature,
            humidity=humidity,
            weather_condition=weather_condition,
            precipitation=precipitation,
            wind_speed=wind_speed,
            uv_index=uv_index,
            pressure=pressure,
            cloud_cover=cloud_cover
        )
        
        conn.close()
        
        return jsonify(analysis)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/crop/suggestions', methods=['GET'])
def get_crop_suggestions_api():
    """Get list of common crops for suggestions"""
    try:
        suggestions = get_crop_suggestions()
        return jsonify({"crops": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/humidity/history', methods=['GET'])
def get_humidity_history():
    """Get humidity data for the past 7 days"""
    try:
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get humidity data for the past 7 days
        time_threshold = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
        
        cursor.execute('''
        SELECT DATE(timestamp) as date, 
               humidity
        FROM weather_data
        WHERE latitude = ? AND longitude = ? AND timestamp >= ?
        AND humidity IS NOT NULL
        ORDER BY date ASC, timestamp DESC
        ''', (latitude, longitude, time_threshold))
        
        humidity_data = cursor.fetchall()
        conn.close()
        
        if not humidity_data:
            # If no data, fetch from Open-Meteo API as fallback
            try:
                import requests
                url = "https://api.open-meteo.com/v1/forecast"
                params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": "relative_humidity_2m_max",
                    "timezone": "auto",
                    "past_days": 7
                }
                
                response = requests.get(url, params=params)
                if response.ok:
                    data = response.json()
                    if data.get('daily') and data['daily'].get('time') and data['daily'].get('relative_humidity_2m_max'):
                        humidity_values = data['daily']['relative_humidity_2m_max'][:7]
                        dates = data['daily']['time'][:7]
                        
                        return jsonify({
                            "success": True,
                            "data": [
                                {
                                    "date": date,
                                    "avg_humidity": humidity,
                                    "max_humidity": humidity,
                                    "min_humidity": humidity
                                }
                                for date, humidity in zip(dates, humidity_values)
                            ]
                        })
            except Exception as e:
                print(f"Error fetching fallback humidity data: {str(e)}")
        
        # Process data to get one humidity value per day (latest reading)
        daily_humidity = {}
        for row in humidity_data:
            date = row['date']
            humidity = float(row['humidity']) if row['humidity'] else 0
            # Keep the latest reading for each day
            if date not in daily_humidity:
                daily_humidity[date] = humidity
        
        # Convert to list and ensure we have 7 days
        humidity_list = []
        for i in range(7):
            target_date = (datetime.now() - timedelta(days=6-i)).strftime('%Y-%m-%d')
            humidity_list.append({
                "date": target_date,
                "humidity": daily_humidity.get(target_date, 0)
            })
        
        # Return database data
        return jsonify({
            "success": True,
            "data": humidity_list
        })
        
    except Exception as e:
        print(f"Error getting humidity history: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/weather/refresh', methods=['POST'])
def refresh_weather_data():
    """Manually refresh weather data from Open-Meteo API"""
    try:
        from services.weather_fetcher import get_current_temperature
        current_temp = get_current_temperature()
        return jsonify({
            "success": True,
            "message": "Weather data refreshed successfully",
            "temperature": current_temp
        })
    except Exception as e:
        print(f"Error refreshing weather data: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route('/api/weather/current', methods=['GET'])
def get_current_weather():
    """Get current comprehensive weather data for agriculture"""
    try:
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get latest weather data
        cursor.execute('''
        SELECT * FROM weather_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        
        weather = cursor.fetchone()
        conn.close()
        
        if not weather:
            # If no weather data in database, fetch fresh data from Open-Meteo API
            try:
                from services.weather_fetcher import get_current_temperature
                current_temp = get_current_temperature()
                
                # Try to get the weather data again after fetching
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('''
                SELECT * FROM weather_data
                WHERE latitude = ? AND longitude = ?
                ORDER BY timestamp DESC
                LIMIT 1
                ''', (latitude, longitude))
                
                weather = cursor.fetchone()
                conn.close()
                
                if not weather:
                    # If still no weather data, return basic temperature
                    return jsonify({
                        "timestamp": datetime.now().isoformat(),
                        "temperature": current_temp,
                        "humidity": None,
                        "precipitation": None,
                        "wind_speed": None,
                        "uv_index": None,
                        "pressure": None,
                        "cloud_cover": None,
                        "irrigation_advice": "Weather data not available. Using temperature only."
                    })
            except Exception as e:
                print(f"Error fetching fresh weather data: {str(e)}")
                return jsonify({
                    "error": "Unable to fetch weather data",
                    "timestamp": datetime.now().isoformat(),
                    "temperature": None,
                    "humidity": None,
                    "precipitation": None,
                    "wind_speed": None,
                    "uv_index": None,
                    "pressure": None,
                    "cloud_cover": None
                })
        
        # Debug: Print the raw weather data
        print(f"Raw weather data from DB: {dict(weather)}")
        
        return jsonify({
            "timestamp": weather['timestamp'],
            "temperature": float(weather['temperature']),
            "humidity": float(weather['humidity']) if weather['humidity'] else None,
            "precipitation": float(weather['precipitation']) if weather['precipitation'] else None,
            "wind_speed": float(weather['wind_speed']) if weather['wind_speed'] else None,
            "uv_index": float(weather['uv_index']) if weather['uv_index'] else None,
            "pressure": float(weather['pressure']) if weather['pressure'] else None,
            "cloud_cover": float(weather['cloud_cover']) if weather['cloud_cover'] else None,
            "irrigation_advice": generate_irrigation_advice(weather)
        })
        
    except Exception as e:
        print(f"Error getting current weather: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/irrigation/advice', methods=['GET'])
def get_irrigation_advice():
    """Get AI-powered irrigation advice based on current weather conditions"""
    try:
        latitude = request.args.get('latitude', DEFAULT_LATITUDE)
        longitude = request.args.get('longitude', DEFAULT_LONGITUDE)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get latest weather data
        cursor.execute('''
        SELECT * FROM weather_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''', (latitude, longitude))
        
        weather = cursor.fetchone()
        conn.close()
        
        if not weather:
            # Try to fetch fresh weather data
            try:
                from services.weather_fetcher import get_current_temperature
                current_temp = get_current_temperature()
                
                # Try to get the weather data again after fetching
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('''
                SELECT * FROM weather_data
                WHERE latitude = ? AND longitude = ?
                ORDER BY timestamp DESC
                LIMIT 1
                ''', (latitude, longitude))
                
                weather = cursor.fetchone()
                conn.close()
                
                if not weather:
                    return jsonify({
                        "error": "No weather data available for irrigation advice",
                        "advice": "Please ensure weather data is being collected."
                    })
            except Exception as e:
                print(f"Error fetching fresh weather data for irrigation: {str(e)}")
                return jsonify({
                    "error": "Unable to fetch weather data for irrigation advice",
                    "advice": "Please try again later."
                })
        
        # Generate comprehensive irrigation advice using Gemini AI
        irrigation_analysis = generate_ai_irrigation_advice(weather)
        
        return jsonify({
            "timestamp": weather['timestamp'],
            "current_conditions": {
                "temperature": float(weather['temperature']),
                "humidity": float(weather['humidity']) if weather['humidity'] else None,
                "precipitation": float(weather['precipitation']) if weather['precipitation'] else None,
                "wind_speed": float(weather['wind_speed']) if weather['wind_speed'] else None,
                "uv_index": float(weather['uv_index']) if weather['uv_index'] else None,
                "pressure": float(weather['pressure']) if weather['pressure'] else None,
                "cloud_cover": float(weather['cloud_cover']) if weather['cloud_cover'] else None
            },
            "irrigation_advice": {
                "summary": irrigation_analysis.get("summary", "Weather-based irrigation analysis completed.") if isinstance(irrigation_analysis, dict) else "Weather-based irrigation analysis completed.",
                "detailed_advice": irrigation_analysis.get("detailed_advice", []) if isinstance(irrigation_analysis, dict) else [],
                "overall_recommendation": irrigation_analysis.get("overall_recommendation", "NORMAL SCHEDULE") if isinstance(irrigation_analysis, dict) else "NORMAL SCHEDULE",
                "ai_analysis": irrigation_analysis.get("ai_analysis", "") if isinstance(irrigation_analysis, dict) else ""
            }
        })
        
    except Exception as e:
        print(f"Error getting irrigation advice: {str(e)}")
        return jsonify({"error": str(e)})

def generate_ai_irrigation_advice(weather):
    """Generate AI-powered irrigation advice using Gemini"""
    if not weather:
        return "Weather data not available for irrigation advice."
    
    try:
        from services.gemini_service import analyze_irrigation_weather
        
        # Extract weather parameters
        temp = weather['temperature'] if weather['temperature'] is not None else 0
        humidity = weather['humidity'] if weather['humidity'] is not None else 0
        precipitation = weather['precipitation'] if weather['precipitation'] is not None else 0
        wind_speed = weather['wind_speed'] if weather['wind_speed'] is not None else 0
        uv_index = weather['uv_index'] if weather['uv_index'] is not None else 0
        pressure = weather['pressure'] if weather['pressure'] is not None else 0
        cloud_cover = weather['cloud_cover'] if weather['cloud_cover'] is not None else 0
        
        # Get AI-powered irrigation analysis
        ai_analysis = analyze_irrigation_weather(
            temperature=temp,
            humidity=humidity,
            precipitation=precipitation,
            wind_speed=wind_speed,
            uv_index=uv_index,
            pressure=pressure,
            cloud_cover=cloud_cover
        )
        
        return ai_analysis
        
    except Exception as e:
        print(f"Error generating AI irrigation advice: {str(e)}")
        # Fallback to basic logic if AI fails
        return generate_comprehensive_irrigation_advice(weather)

def generate_comprehensive_irrigation_advice(weather):
    """Generate comprehensive irrigation advice based on weather conditions"""
    if not weather:
        return "Weather data not available for irrigation advice."
    
    temp = weather['temperature'] if weather['temperature'] is not None else 0
    humidity = weather['humidity'] if weather['humidity'] is not None else 0
    precipitation = weather['precipitation'] if weather['precipitation'] is not None else 0
    wind_speed = weather['wind_speed'] if weather['wind_speed'] is not None else 0
    uv_index = weather['uv_index'] if weather['uv_index'] is not None else 0
    cloud_cover = weather['cloud_cover'] if weather['cloud_cover'] is not None else 0
    
    advice_sections = []
    
    # Temperature-based advice
    if temp > 30:
        advice_sections.append({
            "factor": "High Temperature",
            "impact": "High evaporation rates, increased water demand",
            "recommendation": "Increase irrigation frequency and duration",
            "priority": "High"
        })
    elif temp < 10:
        advice_sections.append({
            "factor": "Low Temperature",
            "impact": "Reduced evaporation, risk of waterlogging",
            "recommendation": "Reduce irrigation frequency, avoid overwatering",
            "priority": "Medium"
        })
    
    # Humidity-based advice
    if humidity < 40:
        advice_sections.append({
            "factor": "Low Humidity",
            "impact": "High transpiration rates, increased water loss",
            "recommendation": "Increase irrigation frequency, consider misting systems",
            "priority": "High"
        })
    elif humidity > 80:
        advice_sections.append({
            "factor": "High Humidity",
            "impact": "Reduced transpiration, increased disease risk",
            "recommendation": "Reduce irrigation, improve ventilation",
            "priority": "Medium"
        })
    
    # Precipitation-based advice
    if precipitation > 5:
        advice_sections.append({
            "factor": "Heavy Rainfall",
            "impact": "Sufficient soil moisture, risk of runoff",
            "recommendation": "Skip irrigation today, monitor soil drainage",
            "priority": "High"
        })
    elif precipitation > 0:
        advice_sections.append({
            "factor": "Light Rainfall",
            "impact": "Some soil moisture added",
            "recommendation": "Reduce irrigation amount by 50%",
            "priority": "Medium"
        })
    
    # Wind-based advice
    if wind_speed > 20:
        advice_sections.append({
            "factor": "High Winds",
            "impact": "Increased evaporation, irrigation inefficiency",
            "recommendation": "Avoid overhead irrigation, use drip systems",
            "priority": "High"
        })
    
    # UV Index advice
    if uv_index > 8:
        advice_sections.append({
            "factor": "High UV Index",
            "impact": "Increased plant stress, higher water demand",
            "recommendation": "Irrigate early morning or evening, provide shade",
            "priority": "Medium"
        })
    
    # Cloud cover advice
    if cloud_cover > 80:
        advice_sections.append({
            "factor": "Heavy Cloud Cover",
            "impact": "Reduced evaporation, lower water demand",
            "recommendation": "Reduce irrigation frequency",
            "priority": "Low"
        })
    
    if not advice_sections:
        advice_sections.append({
            "factor": "Optimal Conditions",
            "impact": "Weather conditions are favorable for normal irrigation",
            "recommendation": "Continue with regular irrigation schedule",
            "priority": "Low"
        })
    
    return {
        "summary": generate_irrigation_summary(advice_sections),
        "detailed_advice": advice_sections,
        "overall_recommendation": get_overall_irrigation_recommendation(advice_sections)
    }

def generate_irrigation_summary(advice_sections):
    """Generate a summary of irrigation advice"""
    high_priority = [advice for advice in advice_sections if advice["priority"] == "High"]
    medium_priority = [advice for advice in advice_sections if advice["priority"] == "Medium"]
    
    if high_priority:
        return f"Critical irrigation adjustments needed: {len(high_priority)} high-priority factors detected."
    elif medium_priority:
        return f"Moderate irrigation adjustments recommended: {len(medium_priority)} factors to consider."
    else:
        return "Weather conditions are optimal for normal irrigation practices."

def get_overall_irrigation_recommendation(advice_sections):
    """Get overall irrigation recommendation"""
    high_priority = [advice for advice in advice_sections if advice["priority"] == "High"]
    
    if high_priority:
        return "ADJUST IMMEDIATELY"
    elif len(advice_sections) > 2:
        return "MODERATE ADJUSTMENTS"
    else:
        return "NORMAL SCHEDULE"

def generate_irrigation_advice(weather):
    """Generate irrigation advice based on weather conditions"""
    if not weather:
        return "Weather data not available for irrigation advice."
    
    temp = weather['temperature'] if weather['temperature'] is not None else 0
    humidity = weather['humidity'] if weather['humidity'] is not None else 0
    precipitation = weather['precipitation'] if weather['precipitation'] is not None else 0
    wind_speed = weather['wind_speed'] if weather['wind_speed'] is not None else 0
    
    advice = []
    
    # Temperature-based advice
    if temp > 30:
        advice.append("High temperature detected. Consider additional irrigation.")
    elif temp < 10:
        advice.append("Low temperature. Reduce irrigation to prevent waterlogging.")
    
    # Humidity-based advice
    if humidity < 40:
        advice.append("Low humidity. Increase irrigation frequency.")
    elif humidity > 80:
        advice.append("High humidity. Reduce irrigation to prevent fungal diseases.")
    
    # Precipitation-based advice
    if precipitation > 5:
        advice.append("Recent rainfall detected. Skip irrigation for today.")
    elif precipitation > 0:
        advice.append("Light rainfall. Reduce irrigation amount.")
    
    # Wind-based advice
    if wind_speed > 20:
        advice.append("High winds. Avoid overhead irrigation to prevent water loss.")
    
    if not advice:
        advice.append("Weather conditions are optimal for normal irrigation schedule.")
    
    return " ".join(advice)

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
    """Add headers to prevent caching for real-time data and ensure CORS"""
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        # Ensure CORS headers are set for API routes
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
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