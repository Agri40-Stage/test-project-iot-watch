import os
import time
import threading
import schedule
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from db.schema import init_db
from db.maintenance import purge_old_data
from services.weather_fetcher import fetch_and_store_current_weather
from services.prediction_service import update_all_predictions

from api.latest import latest_bp
from api.history import history_bp
from api.weekly_stats import weekly_stats_bp
from api.predictions import predictions_bp
from api.humidity import humidity_bp

load_dotenv()
app = Flask(__name__)
CORS(app)

app.register_blueprint(latest_bp, url_prefix='/api')
app.register_blueprint(history_bp, url_prefix='/api')
app.register_blueprint(weekly_stats_bp, url_prefix='/api')
app.register_blueprint(predictions_bp, url_prefix='/api')
app.register_blueprint(humidity_bp, url_prefix='/api')

init_db()

def run_background_services():
    def weather_updater():
        """Update weather data continuously"""
        while True:
            try:
                fetch_and_store_current_weather()
                # Let's increase the interval slightly to avoid hitting API rate limits
                time.sleep(5) 
            except Exception as e:
                print(f"Error in weather updater: {str(e)}")
                time.sleep(5)
    
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
    
    weather_thread = threading.Thread(target=weather_updater)
    weather_thread.daemon = True
    weather_thread.start()
    print("Background weather updates started")
  
    scheduler_thread = threading.Thread(target=scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    print(f"Prediction updates scheduled (daily at midnight)")
    
    print("All background services started successfully")

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