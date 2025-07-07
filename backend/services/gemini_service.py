import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key="AIzaSyB8he_s78fWHvZiWHw2vRGcWpl1mr8U0nw")

def analyze_crop_weather(crop_name, temperature, humidity=None, weather_condition=None, 
                        precipitation=None, wind_speed=None, uv_index=None, pressure=None, cloud_cover=None):
    """
    Analyze weather impact on a specific crop using Gemini AI with comprehensive weather data
    """
    try:
        # Create Gemini model instance
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build comprehensive weather context
        weather_context = f"""
        Current weather conditions:
        - Temperature: {temperature}°C
        - Humidity: {humidity}% {'(available)' if humidity is not None else '(not available)'}
        - Precipitation: {precipitation}mm {'(available)' if precipitation is not None else '(not available)'}
        - Wind Speed: {wind_speed} km/h {'(available)' if wind_speed is not None else '(not available)'}
        - UV Index: {uv_index} {'(available)' if uv_index is not None else '(not available)'}
        - Atmospheric Pressure: {pressure} hPa {'(available)' if pressure is not None else '(not available)'}
        - Cloud Cover: {cloud_cover}% {'(available)' if cloud_cover is not None else '(not available)'}
        - Weather Condition: {weather_condition}
        """
        
        # Build the prompt
        prompt = f"""
        You are an expert agricultural advisor specializing in precision agriculture and weather-based crop management. 
        Analyze the weather impact on {crop_name} using the following comprehensive weather data:
        
        {weather_context}
        
        Provide a detailed agricultural analysis including:
        
        1. **Temperature Analysis**: 
           - How current temperature affects {crop_name} growth and development
           - Optimal temperature range for {crop_name}
           - Temperature stress indicators
        
        2. **Humidity Impact** (if data available):
           - Humidity effects on {crop_name} health
           - Disease risk assessment
           - Transpiration rates
        
        3. **Precipitation & Irrigation** (if data available):
           - Current precipitation adequacy
           - Irrigation recommendations
           - Water management strategies
        
        4. **Wind Effects** (if data available):
           - Wind impact on pollination
           - Physical damage risk
           - Evaporation rates
        
        5. **UV Index & Solar Radiation** (if data available):
           - Photosynthesis efficiency
           - Plant stress levels
           - Sunburn risk for sensitive crops
        
        6. **Risk Assessment**:
           - Overall risk level (Low/Medium/High)
           - Specific risk factors
           - Mitigation strategies
        
        7. **Immediate Actions**:
           - Specific recommendations for current conditions
           - Irrigation adjustments
           - Protective measures if needed
        
        8. **Agricultural Best Practices**:
           - Optimal timing for activities
           - Resource management tips
           - Monitoring recommendations
        
        Format your response in clear sections with practical, actionable advice for farmers.
        Focus on precision agriculture techniques and data-driven recommendations.
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        return {
            "success": True,
            "crop": crop_name,
            "current_conditions": {
                "temperature": temperature,
                "humidity": humidity,
                "precipitation": precipitation,
                "wind_speed": wind_speed,
                "uv_index": uv_index,
                "pressure": pressure,
                "cloud_cover": cloud_cover,
                "weather_condition": weather_condition
            },
            "ai_advice": response.text,
            "risk_level": extract_risk_level(response.text),
            "recommendations": extract_recommendations(response.text)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "crop": crop_name,
            "ai_advice": f"Unable to analyze {crop_name} at this time. Please try again later."
        }

def extract_risk_level(advice_text):
    """Extract risk level from AI advice"""
    advice_lower = advice_text.lower()
    if "high risk" in advice_lower or "critical" in advice_lower:
        return "High"
    elif "medium risk" in advice_lower or "moderate" in advice_lower:
        return "Medium"
    else:
        return "Low"

def extract_recommendations(advice_text):
    """Extract key recommendations from AI advice"""
    recommendations = []
    lines = advice_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.startswith(('-', '•', '*', '1.', '2.', '3.', '4.', '5.')):
            # Clean up the recommendation
            clean_rec = line.lstrip('-•*123456789. ').strip()
            if clean_rec and len(clean_rec) > 10:
                recommendations.append(clean_rec)
    
    # If no bullet points found, try to extract sentences with action words
    if not recommendations:
        action_words = ['should', 'must', 'need', 'recommend', 'suggest', 'consider']
        sentences = advice_text.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence.lower() for word in action_words) and len(sentence) > 20:
                recommendations.append(sentence)
    
    return recommendations[:5]  # Return max 5 recommendations

def analyze_irrigation_weather(temperature, humidity=None, precipitation=None, wind_speed=None, 
                              uv_index=None, pressure=None, cloud_cover=None):
    """
    Analyze weather conditions and provide AI-powered irrigation recommendations using Gemini
    """
    try:
        # Create Gemini model instance
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build comprehensive weather context
        weather_context = f"""
        Current weather conditions for irrigation analysis:
        - Temperature: {temperature}°C
        - Humidity: {humidity}% {'(available)' if humidity is not None else '(not available)'}
        - Precipitation: {precipitation}mm {'(available)' if precipitation is not None else '(not available)'}
        - Wind Speed: {wind_speed} km/h {'(available)' if wind_speed is not None else '(not available)'}
        - UV Index: {uv_index} {'(available)' if uv_index is not None else '(not available)'}
        - Atmospheric Pressure: {pressure} hPa {'(available)' if pressure is not None else '(not available)'}
        - Cloud Cover: {cloud_cover}% {'(available)' if cloud_cover is not None else '(not available)'}
        """
        
        # Build the prompt
        prompt = f"""
        You are an expert agricultural irrigation specialist with deep knowledge of precision agriculture and water management.
        
        {weather_context}
        
        Provide a comprehensive irrigation analysis and recommendations including:
        
        1. **Overall Assessment**:
           - Current irrigation needs based on weather conditions
           - Risk level (Low/Medium/High) for crop water stress
           - Overall recommendation (NORMAL SCHEDULE/MODERATE ADJUSTMENTS/ADJUST IMMEDIATELY)
        
        2. **Detailed Weather Impact Analysis**:
           - Temperature effects on evaporation and plant water demand
           - Humidity impact on transpiration and disease risk
           - Precipitation adequacy and timing considerations
           - Wind effects on irrigation efficiency and evaporation
           - UV index impact on plant stress and water requirements
           - Atmospheric pressure effects on plant physiology
        
        3. **Specific Recommendations**:
           - Irrigation timing (when to irrigate)
           - Irrigation amount adjustments
           - Irrigation method recommendations
           - Water conservation strategies
           - Disease prevention measures
        
        4. **Priority Actions**:
           - Immediate actions needed
           - Short-term adjustments (next 24-48 hours)
           - Long-term considerations
        
        Format your response as a structured analysis with clear sections.
        Focus on practical, actionable advice for farmers.
        Include specific recommendations for different crop types if relevant.
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Parse the response to extract structured data
        ai_text = response.text
        
        # Extract key information from AI response
        summary = extract_irrigation_summary(ai_text)
        detailed_advice = extract_irrigation_recommendations(ai_text)
        overall_recommendation = extract_overall_recommendation(ai_text)
        
        return {
            "summary": summary,
            "detailed_advice": detailed_advice,
            "overall_recommendation": overall_recommendation,
            "ai_analysis": ai_text
        }
        
    except Exception as e:
        print(f"Error in AI irrigation analysis: {str(e)}")
        return {
            "summary": "Unable to generate AI irrigation advice at this time.",
            "detailed_advice": [],
            "overall_recommendation": "NORMAL SCHEDULE",
            "ai_analysis": f"Error: {str(e)}"
        }

def extract_irrigation_summary(ai_text):
    """Extract summary from AI irrigation analysis"""
    lines = ai_text.split('\n')
    for line in lines:
        line = line.strip()
        if any(keyword in line.lower() for keyword in ['overall', 'summary', 'assessment', 'current']):
            if len(line) > 20:
                return line
    return "Weather-based irrigation analysis completed."

def extract_irrigation_recommendations(ai_text):
    """Extract detailed recommendations from AI analysis"""
    recommendations = []
    lines = ai_text.split('\n')
    
    current_section = ""
    for line in lines:
        line = line.strip()
        if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.')):
            current_section = line
        elif line.startswith(('-', '•', '*')) and len(line) > 20:
            clean_rec = line.lstrip('-•* ').strip()
            if clean_rec:
                recommendations.append({
                    "factor": current_section or "Irrigation Factor",
                    "impact": clean_rec,
                    "recommendation": clean_rec,
                    "priority": "Medium"
                })
    
    # If no structured recommendations found, create from key sentences
    if not recommendations:
        action_words = ['irrigate', 'water', 'reduce', 'increase', 'adjust', 'schedule', 'timing']
        sentences = ai_text.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence.lower() for word in action_words) and len(sentence) > 30:
                recommendations.append({
                    "factor": "Irrigation Recommendation",
                    "impact": sentence,
                    "recommendation": sentence,
                    "priority": "Medium"
                })
    
    return recommendations[:6]  # Return max 6 recommendations

def extract_overall_recommendation(ai_text):
    """Extract overall recommendation from AI analysis"""
    ai_lower = ai_text.lower()
    if any(phrase in ai_lower for phrase in ['adjust immediately', 'critical', 'urgent', 'emergency']):
        return "ADJUST IMMEDIATELY"
    elif any(phrase in ai_lower for phrase in ['moderate adjustments', 'some changes', 'minor adjustments']):
        return "MODERATE ADJUSTMENTS"
    else:
        return "NORMAL SCHEDULE"

def get_crop_suggestions():
    """Get list of common crops for suggestions"""
    return [
        "Strawberries", "Tomatoes", "Corn", "Wheat", "Rice", "Potatoes",
        "Lettuce", "Carrots", "Onions", "Peppers", "Cucumbers", "Beans",
        "Peas", "Spinach", "Kale", "Broccoli", "Cauliflower", "Cabbage",
        "Apples", "Oranges", "Grapes", "Blueberries", "Raspberries",
        "Peaches", "Pears", "Cherries", "Almonds", "Walnuts", "Coffee",
        "Tea", "Cotton", "Soybeans", "Sunflowers", "Canola", "Barley"
    ] 