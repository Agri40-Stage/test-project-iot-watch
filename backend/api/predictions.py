
import traceback
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from db.connection import get_db_connection
from services.prediction_service import update_all_predictions

predictions_bp = Blueprint('predictions_bp', __name__)

@predictions_bp.route('/predict', methods=['GET'])
def predict_temperature():
    """Get temperature predictions from the database for a specific day."""
    try:
        day = int(request.args.get('day', '1'))
        if day < 1 or day > 5:
            return jsonify({"error": "Day parameter must be between 1 and 5"})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        tomorrow = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        start_time = tomorrow + timedelta(days=day - 1)
        end_time = start_time + timedelta(days=1)
        
        cursor.execute('SELECT * FROM temperature_predictions WHERE target_date >= ? AND target_date < ? ORDER BY hour ASC', (start_time.isoformat(), end_time.isoformat()))
        predictions = cursor.fetchall()
        
        if not predictions:
            print(f"No predictions found for day {day}, triggering a full forecast update...")
            update_all_predictions()
            cursor.execute('SELECT * FROM temperature_predictions WHERE target_date >= ? AND target_date < ? ORDER BY hour ASC', (start_time.isoformat(), end_time.isoformat()))
            predictions = cursor.fetchall()

        conn.close()
        
        if not predictions:
             return jsonify({"error": f"Still no prediction data available for day {day} after refresh."}), 404

        hourly_predictions = []
        timestamps = [p['target_date'] for p in predictions]
        temperatures = [p['temperature'] for p in predictions]
        
        for pred in predictions:
            target_time = datetime.fromisoformat(pred['target_date'])
            hourly_predictions.append({"hour": pred['hour'], "time": target_time.strftime("%H:00"), "temperature": pred['temperature']})
        
        return jsonify({
            "day": day, "date": start_time.strftime("%Y-%m-%d"), "day_of_week": start_time.strftime("%A"),
            "timestamps": timestamps, "predictions": temperatures, "hourly": hourly_predictions,
            "min_temp": min(temperatures), "max_temp": max(temperatures),
            "avg_temp": sum(temperatures) / len(temperatures)
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@predictions_bp.route('/forecast', methods=['GET'])
def get_forecast():
    """Get a comprehensive 5-day hourly forecast"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        current_datetime = datetime.now().isoformat()
        
        cursor.execute('SELECT * FROM temperature_predictions WHERE target_date >= ? ORDER BY target_date ASC, hour ASC', (current_datetime,))
        all_predictions = cursor.fetchall()
        conn.close()
        
        if not all_predictions:
            print("No predictions found. Generating new predictions.")
            update_all_predictions()
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM temperature_predictions WHERE target_date >= ? ORDER BY target_date ASC, hour ASC', (current_datetime,))
            all_predictions = cursor.fetchall()
            conn.close()
            if not all_predictions:
                return jsonify({"success": False, "message": "No forecast data available", "days": []})
        
        today_midnight = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        forecast = []
        for i in range(1, 6):
            day_start = today_midnight + timedelta(days=i - 1)
            day_end = day_start + timedelta(days=1)
            day_predictions = [dict(p) for p in all_predictions if day_start.isoformat() <= p['target_date'] < day_end.isoformat()]
            
            if day_predictions:
                temperatures = [p['temperature'] for p in day_predictions]
                day_date = datetime.fromisoformat(day_predictions[0]['target_date']).replace(hour=0)                
                hourly = []
                for p in day_predictions:
                    target_time = datetime.fromisoformat(p['target_date'])
                    hourly.append({"hour": p['hour'], "time": target_time.strftime("%H:00"), "temperature": p['temperature'], "timestamp": p['target_date']})
                hourly.sort(key=lambda x: x['hour'])
                
                forecast.append({
                    "day_number": i, "date": day_date.strftime("%Y-%m-%d"), "day_of_week": day_date.strftime("%A"),
                    "min_temp": min(temperatures) if temperatures else None, "max_temp": max(temperatures) if temperatures else None,
                    "avg_temp": sum(temperatures) / len(temperatures) if temperatures else None,
                    "prediction_count": len(hourly), "hourly": hourly
                })
        
        forecast.sort(key=lambda x: x['day_number'])        
        last_prediction_date = max([datetime.fromisoformat(p['prediction_date']) for p in all_predictions]) if all_predictions else None
        next_update = last_prediction_date + timedelta(days=1) if last_prediction_date else datetime.now() + timedelta(days=1)
        
        return jsonify({
            "success": True, "days": len(forecast),
            "last_updated": last_prediction_date.isoformat() if last_prediction_date else None,
            "next_update": next_update.isoformat(), "update_frequency": "daily", "forecast": forecast
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})