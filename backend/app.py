import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for React frontend

# Add error handler to debug 404s
@app.errorhandler(404)
def page_not_found(e):
    # Print the requested URL to the terminal usually running the backend
    print(f"❌ 404 Request for: {request.path}")
    return jsonify(error="Route not found", path=request.path), 404

@app.route('/api/sensor', methods=['GET'])
def get_sensor_data():
    from datetime import datetime
    print("\n" + "="*60)
    print("🔄 [API] New request received at /api/sensor")
    print(f"📍 [API] Request from: {request.remote_addr}")
    print(f"🕒 [API] Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    try:
        # 1. Fetch Data (User Story 2)
        # Agadir Coordinates
        url = "https://api.open-meteo.com/v1/forecast?latitude=30.42&longitude=-9.59&current_weather=true"
        print(f"🌐 [API] Fetching weather data from: {url}")
        
        response = requests.get(url, timeout=5)
        print(f"✅ [API] External API response: {response.status_code}")
        
        response.raise_for_status()
        data = response.json()
        temp = data['current_weather']['temperature']
        windspeed = data['current_weather']['windspeed']
        
        print(f"🌡️  [API] Temperature: {temp}°C")
        print(f"💨 [API] Wind Speed: {windspeed} km/h")
        
        # 2. AI Logic (User Story 3) - Simple AI for farmers
        ai_message = ""
        status = "normal"
        
        if temp > 30:
            ai_message = "⚠️ Alert: High temperature! Immediate irrigation recommended."
            status = "danger"
            print(f"🚨 [AI] Status: DANGER - High temperature detected")
        elif temp < 10:
            ai_message = "❄️ Alert: Low temperature! Please protect crops."
            status = "warning"
            print(f"⚠️  [AI] Status: WARNING - Low temperature detected")
        else:
            ai_message = "✅ Weather conditions are optimal for growth."
            status = "success"
            print(f"✅ [AI] Status: SUCCESS - Optimal conditions")

        response_data = {
            "temperature": temp,
            "windspeed": windspeed,
            "advice": ai_message,
            "status": status,
            "location": "Agadir, Morocco"
        }
        
        print(f"📤 [API] Sending response with status: {status}")
        print("="*60 + "\n")
        
        return jsonify(response_data)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": str(e), "temperature": 0, "windspeed": 0, "advice": "Error fetching data", "status": "danger", "location": "Error"}), 500

@app.route('/', methods=['GET'])
def home():
    return "Backend is running! Use /api/sensor to get data."

if __name__ == '__main__':
    # Print banner
    print("\n" + "="*60)
    print("🌱 AGRI 4.0 - Backend API Server")
    print("="*60)
    
    # Print available routes
    print("\n📋 Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"  ├─ {rule} -> {rule.endpoint}")
        
    print("\n" + "="*60)
    print("🚀 Server starting...")
    print("📡 API Endpoint: http://localhost:5000/api/sensor")
    print("🌍 CORS: Enabled for all origins")
    print("⚠️  Debug Mode: ON (Development Only)")
    print("="*60 + "\n")
        
    # Run slightly differently to ensure binding is open and debug is on
    app.run(host='0.0.0.0', port=5000, debug=True)