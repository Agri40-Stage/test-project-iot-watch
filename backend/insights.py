import os
import sqlite3
import json
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Gemini SDK
import google.generativeai as genai

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
relative_path = os.getenv("DATABASE_PATH", "database/temperature.db")
DB_PATH = os.path.join(BASE_DIR, relative_path)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")

def fetch_data_window(hours=24):
    """Return list of (timestamp, temp) for last `hours` and next `hours` forecasts."""
    try:
        print(f"[DEBUG] Fetching data window for {hours} hours")
        print(f"[DEBUG] Database path: {DB_PATH}")
        print(f"[DEBUG] Database exists: {os.path.exists(DB_PATH)}")
        
        # Ensure directory exists
        db_dir = os.path.dirname(DB_PATH)
        if not os.path.isdir(db_dir):
            print(f"[DEBUG] Creating database directory: {db_dir}")
            os.makedirs(db_dir, exist_ok=True)
        
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        now = datetime.now()
        past_cutoff = (now - timedelta(hours=hours)).isoformat()
        future_cutoff = (now + timedelta(hours=hours)).isoformat()
        
        print(f"[DEBUG] Time range: {past_cutoff} to {future_cutoff}")
        
        # Get actuals
        cur.execute("""
            SELECT timestamp, temperature
            FROM temperature_data
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC
        """, (past_cutoff, now.isoformat()))
        actuals = cur.fetchall()
        
        # Get forecasts
        cur.execute("""
            SELECT target_date AS timestamp, temperature
            FROM temperature_predictions
            WHERE target_date BETWEEN ? AND ?
            ORDER BY target_date ASC
        """, (now.isoformat(), future_cutoff))
        preds = cur.fetchall()
        
        conn.close()
        
        print(f"[DEBUG] Found {len(actuals)} actual readings and {len(preds)} predictions")
        
        return actuals, preds
        
    except sqlite3.Error as e:
        print(f"[ERROR] Database error in fetch_data_window: {e}")
        return [], []
    except Exception as e:
        print(f"[ERROR] Unexpected error in fetch_data_window: {e}")
        import traceback
        traceback.print_exc()
        return [], []

def build_prompt(actuals, preds):
    """Build the prompt for Gemini AI"""
    try:
        def fmt(rows):
            if not rows:
                return "No data available"
            return "\n".join(f"{r['timestamp'][:16]} → {r['temperature']:.1f}°C" for r in rows[:10])  # Limit to 10 entries
        
        actuals_str = fmt(actuals)
        preds_str = fmt(preds)
        
        prompt = (
            "You are a weather analyst. Given these actual and forecast temperatures, "
            "write a concise 2–3 sentence summary and 3 bullet-point insights.\n\n"
            f"Actuals (last 24h):\n{actuals_str}\n\n"
            f"Forecast (next 24h):\n{preds_str}\n\n"
            "Return ONLY valid JSON with this exact structure (no markdown, no extra text):\n"
            '{"summary": "your summary here", "highlights": ["point 1", "point 2", "point 3"]}'
        )
        
        print(f"[DEBUG] Prompt length: {len(prompt)} characters")
        return prompt
        
    except Exception as e:
        print(f"[ERROR] Error building prompt: {e}")
        return None

def clean_json_response(response_text):
    """Clean and extract JSON from Gemini response"""
    try:
        print(f"[DEBUG] Original response: {response_text[:200]}...")
        
        # Remove any markdown code blocks
        cleaned = re.sub(r'```json\s*', '', response_text)
        cleaned = re.sub(r'```\s*', '', cleaned)
        cleaned = cleaned.strip()
        
        print(f"[DEBUG] After markdown removal: {cleaned[:200]}...")
        
        # Find JSON object in the response
        json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if json_match:
            result = json_match.group(0).strip()
            print(f"[DEBUG] Extracted JSON: {result[:100]}...")
            return result
        
        print(f"[DEBUG] No JSON match found, returning cleaned: {cleaned[:100]}...")
        return cleaned
        
    except Exception as e:
        print(f"[ERROR] Error cleaning JSON response: {e}")
        return response_text

def generate_insights():
    """Generate weather insights using Gemini AI"""
    try:
        print("[DEBUG] Starting insights generation")
        
        # Check API key
        if not GEMINI_API_KEY:
            return {
                "error": "Missing API key", 
                "message": "GEMINI_API_KEY not found in environment variables"
            }
        
        # Fetch data
        actuals, preds = fetch_data_window(24)
        
        if not actuals and not preds:
            return {
                "error": "No data available", 
                "message": "Neither actual readings nor predictions found in database"
            }
        
        if not actuals:
            return {
                "error": "No historical data", 
                "message": "No actual temperature readings found for the last 24 hours"
            }
        
        if not preds:
            return {
                "error": "No forecast data", 
                "message": "No temperature predictions found for the next 24 hours"
            }
        
        # Build prompt
        prompt = build_prompt(actuals, preds)
        if not prompt:
            return {"error": "Failed to build prompt"}
        
        print("[DEBUG] Calling Gemini API")
        
        # Call Gemini API
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return {"error": "Empty response from Gemini API"}
        
        print(f"[DEBUG] Raw API response: {response.text[:200]}...")
        
        # Clean and parse JSON
        cleaned_response = clean_json_response(response.text)
        
        try:
            result = json.loads(cleaned_response)
            
            # Validate structure
            if not isinstance(result, dict):
                raise ValueError("Response is not a JSON object")
            
            if "summary" not in result or "highlights" not in result:
                raise ValueError("Missing required fields: summary or highlights")
            
            if not isinstance(result["highlights"], list):
                raise ValueError("highlights must be a list")
            
            print("[DEBUG] Successfully generated insights")
            return result
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON parsing failed: {e}")
            print(f"[ERROR] Cleaned response: {cleaned_response}")
            
            # Return a fallback response
            return {
                "summary": "Weather data analysis is temporarily unavailable due to formatting issues.",
                "highlights": [
                    f"Found {len(actuals)} actual temperature readings",
                    f"Found {len(preds)} temperature predictions",
                    "Detailed analysis will be available once the issue is resolved"
                ],
                "raw_response": response.text,
                "error": f"JSON parsing error: {str(e)}"
            }
        
    except Exception as e:
        print(f"[ERROR] Unexpected error in generate_insights: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "error": "Failed to generate insights", 
            "message": str(e),
            "traceback": traceback.format_exc()
        }

# Test function for debugging
def test_insights():
    """Test function to debug insights generation"""
    print("Testing insights generation...")
    result = generate_insights()
    print(f"Result: {json.dumps(result, indent=2)}")
    return result

if __name__ == "__main__":
    test_insights()