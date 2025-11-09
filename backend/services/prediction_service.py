import time
import sqlite3
import numpy as np
import traceback
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE
from ai.model_loader import load_prediction_model

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
            
            cursor.execute('SELECT timestamp, temperature FROM temperature_data ORDER BY timestamp DESC LIMIT 168')
            history = cursor.fetchall()
            if not history:
                raise ValueError("No historical data available for predictions")
            
            historical_temps = np.array([record[1] for record in history], dtype=np.float32)            
            scaler = MinMaxScaler(feature_range=(-1, 1))
            data_scaled = scaler.fit_transform(historical_temps.reshape(-1, 1))
            
            if len(data_scaled) < 30:
                pad_amount = 30 - len(data_scaled)
                data_scaled = np.pad(data_scaled, ((pad_amount, 0), (0, 0)), mode='wrap')
            
            sequence = data_scaled[-30:].reshape(1, 30, 1)            
            predictions = model.predict(sequence, verbose=0)
            base_temp = float(scaler.inverse_transform(predictions)[0][0])
            
            hourly_predictions, timestamps = [], []
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
                    INSERT INTO temperature_predictions (prediction_date, target_date, hour, temperature, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''', (datetime.now().isoformat(), timestamp.isoformat(), hour, temperature, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
                    hourly_predictions.append(float(temperature))
                    timestamps.append(timestamp.isoformat())
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e):
                        print(f"Database locked, retrying hour {hour}")
                        time.sleep(0.1)
                        continue
                    raise
            
            conn.commit()
            print(f"Successfully stored {len(hourly_predictions)} hourly predictions for day {day}")
            
            return {
                "day": day, "date": start_time.strftime("%Y-%m-%d"), "day_of_week": start_time.strftime("%A"),
                "timestamps": timestamps, "predictions": hourly_predictions,
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

def update_all_predictions():
    """Update all predictions for the next 5 days."""
    try:
        print(f"[{datetime.now().isoformat()}] Starting daily prediction update for next 5 days...")
        conn = get_db_connection()
        cursor = conn.cursor()        
        cursor.execute('DELETE FROM temperature_predictions')
        conn.commit()
        print("Cleared existing predictions")
        
        prediction_count = 0
        for day in range(1, 6):
            try:
                # This is now a local call within the same file, no import needed
                result = predict_for_day(day)
                if result and "error" in result:
                    print(f"Error predicting day {day}: {result['error']}")
                elif result:
                    prediction_count += len(result.get("predictions", []))
                    print(f"Successfully generated predictions for day {day}")
            except Exception as e:
                print(f"Error processing day {day}: {str(e)}")
                continue
        
        conn.close()
        print(f"[{datetime.now().isoformat()}] Successfully generated {prediction_count} hourly predictions for next 5 days")
        return True
    except Exception as e:
        print(f"Error updating predictions: {str(e)}")
        traceback.print_exc()
        return False