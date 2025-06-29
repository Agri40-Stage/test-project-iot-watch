#!/usr/bin/env python3
"""
AI & IoT Integration Test Script
================================

This script tests the AI and IoT integration features:
- AI weather analysis and predictions
- IoT device simulation
- Anomaly detection
- Pattern classification
- Device health monitoring

Run this script to verify all features are working correctly.
"""

import sys
import os
import time
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_ai_analyzer():
    """Test AI analyzer functionality"""
    print("🧠 Testing AI Analyzer...")
    
    try:
        from services.ai_analyzer import ai_analyzer
        
        # Test temperature prediction
        target_time = datetime.now() + timedelta(hours=24)
        prediction = ai_analyzer.predict_temperature_ai(target_time)
        
        if prediction:
            print(f"✅ AI Temperature Prediction: {prediction['predicted_temperature']:.1f}°C")
            print(f"   Confidence: {prediction['confidence']:.2f}")
        else:
            print("❌ AI Temperature Prediction failed")
        
        # Test anomaly detection
        test_data = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
        anomalies = ai_analyzer.detect_anomalies(test_data)
        print(f"✅ Anomaly Detection: {anomalies['anomalies_detected']} anomalies detected")
        
        # Test pattern classification
        weather_data = {'temperature': 25, 'humidity': 60, 'wind_speed': 15}
        pattern = ai_analyzer.classify_weather_pattern(weather_data)
        print(f"✅ Pattern Classification: {pattern['pattern_type']}")
        
        return True
        
    except Exception as e:
        print(f"❌ AI Analyzer test failed: {str(e)}")
        return False

def test_iot_simulator():
    """Test IoT simulator functionality"""
    print("\n🔌 Testing IoT Simulator...")
    
    try:
        from services.iot_simulator import iot_simulator
        
        # Test sensor status
        status = iot_simulator.get_all_sensors_status()
        print(f"✅ IoT Devices: {status['online_sensors']}/{status['total_sensors']} online")
        
        # Test device health
        health = iot_simulator.get_device_health_summary()
        print(f"✅ Device Health Score: {health['overall_health_score']}%")
        print(f"   Battery Score: {health['battery_score']}%")
        print(f"   Connectivity Score: {health['connectivity_score']}%")
        
        # Test sensor reading
        sensor_reading = iot_simulator.get_sensor_reading('TEMP_001', 25.0)
        if sensor_reading and sensor_reading.get('status') == 'online':
            print(f"✅ Sensor Reading: {sensor_reading['temperature']}°C")
            print(f"   Battery: {sensor_reading['battery_level']}%")
            print(f"   Latency: {sensor_reading['network_latency']}ms")
        else:
            print("❌ Sensor reading failed")
        
        # Test alerts
        alerts = health.get('alerts', [])
        if alerts:
            print(f"⚠️  {len(alerts)} alerts generated")
            for alert in alerts[:2]:  # Show first 2 alerts
                print(f"   - {alert['message']}")
        else:
            print("✅ No alerts generated")
        
        return True
        
    except Exception as e:
        print(f"❌ IoT Simulator test failed: {str(e)}")
        return False

def test_weather_fetcher():
    """Test weather fetcher functionality"""
    print("\n🌤️ Testing Weather Fetcher...")
    
    try:
        from services.weather_fetcher import get_current_weather
        
        weather_data = get_current_weather()
        
        if weather_data:
            print(f"✅ Weather Data Retrieved:")
            print(f"   Temperature: {weather_data['temperature']}°C")
            print(f"   Humidity: {weather_data.get('humidity', 'N/A')}%")
            print(f"   Wind Speed: {weather_data.get('wind_speed', 'N/A')} km/h")
            print(f"   Weather Code: {weather_data.get('weather_code', 'N/A')}")
            return True
        else:
            print("❌ Weather data retrieval failed")
            return False
            
    except Exception as e:
        print(f"❌ Weather Fetcher test failed: {str(e)}")
        return False

def test_ai_insights():
    """Test comprehensive AI insights"""
    print("\n🤖 Testing AI Insights...")
    
    try:
        from services.ai_analyzer import ai_analyzer
        from services.weather_fetcher import get_current_weather
        
        # Get current weather
        current_weather = get_current_weather()
        
        # Get historical data (simulate)
        historical_data = [
            {'temperature': 20 + i} for i in range(20)
        ]
        
        # Generate insights
        insights = ai_analyzer.get_ai_insights(current_weather, historical_data)
        
        if insights and 'ai_analysis' in insights:
            print("✅ AI Insights Generated:")
            
            if 'temperature_prediction' in insights['ai_analysis']:
                pred = insights['ai_analysis']['temperature_prediction']
                print(f"   Prediction: {pred['predicted_temperature']:.1f}°C")
            
            if 'pattern_classification' in insights['ai_analysis']:
                pattern = insights['ai_analysis']['pattern_classification']
                print(f"   Pattern: {pattern['pattern_type']}")
            
            if 'recommendations' in insights['ai_analysis']:
                recs = insights['ai_analysis']['recommendations']
                print(f"   Recommendations: {len(recs)} generated")
            
            return True
        else:
            print("❌ AI insights generation failed")
            return False
            
    except Exception as e:
        print(f"❌ AI Insights test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting AI & IoT Integration Tests")
    print("=" * 50)
    
    tests = [
        ("Weather Fetcher", test_weather_fetcher),
        ("AI Analyzer", test_ai_analyzer),
        ("IoT Simulator", test_iot_simulator),
        ("AI Insights", test_ai_insights),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {str(e)}")
            print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! AI & IoT integration is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 