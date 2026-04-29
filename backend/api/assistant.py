import os
from datetime import datetime, timedelta
import requests
from flask import Blueprint, jsonify, request
from db.connection import get_db_connection
from db.maintenance import DEFAULT_LATITUDE, DEFAULT_LONGITUDE

assistant_bp = Blueprint('assistant_bp', __name__)

SYSTEM_PROMPT = """
Tu es un assistant météo précis et court pour une application IoT.

Règles :
- Réponds en 1 ou 2 phrases maximum
- Donne uniquement la réponse demandée
- Si on demande la température, donne juste la valeur
- Ne répète pas les prévisions sauf si demandé
- Réponds en anglais
"""

# -----------------------------
# DATA FUNCTIONS (tu gardes)
# -----------------------------

def fetch_latest_temperature(cursor):
    cursor.execute(
        '''
        SELECT timestamp, temperature FROM temperature_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''',
        (DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
    )
    return cursor.fetchone()


def fetch_latest_humidity(cursor):
    cursor.execute(
        '''
        SELECT timestamp, humidity FROM humidity_data
        WHERE latitude = ? AND longitude = ?
        ORDER BY timestamp DESC
        LIMIT 1
        ''',
        (DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
    )
    return cursor.fetchone()


def fetch_forecast_summary(cursor):
    now = datetime.now().isoformat()

    cursor.execute(
        '''
        SELECT target_date, temperature FROM temperature_predictions
        WHERE target_date >= ? AND latitude = ? AND longitude = ?
        ORDER BY target_date ASC
        ''',
        (now, DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
    )

    rows = cursor.fetchall()

    forecast_by_day = {}

    for row in rows:
        target_dt = datetime.fromisoformat(row['target_date'])
        date_key = target_dt.date()
        forecast_by_day.setdefault(date_key, []).append(float(row['temperature']))

    today = datetime.now().date()
    summary = []

    for i in range(1, 6):
        day = today + timedelta(days=i)
        temps = forecast_by_day.get(day, [])

        if temps:
            summary.append({
                'day_index': i,
                'date': day.isoformat(),
                'min_temp': min(temps),
                'max_temp': max(temps),
                'avg_temp': round(sum(temps) / len(temps), 1),
                'count': len(temps),
            })
        else:
            summary.append({
                'day_index': i,
                'date': day.isoformat(),
                'min_temp': None,
                'max_temp': None,
                'avg_temp': None,
                'count': 0,
            })

    return summary


def build_context(latest_temp, latest_humidity, forecast_summary):
    parts = []

    if latest_temp:
        parts.append(f"Température actuelle : {latest_temp['temperature']}°C")
    else:
        parts.append("Température actuelle : non disponible")

    if latest_humidity:
        parts.append(f"Humidité actuelle : {latest_humidity['humidity']}%")
    else:
        parts.append("Humidité actuelle : non disponible")

    parts.append("Prévisions 5 jours :")

    for item in forecast_summary:
        if item["count"] > 0:
            parts.append(
                f"{item['date']} → min {item['min_temp']}°C / max {item['max_temp']}°C / moy {item['avg_temp']}°C"
            )
        else:
            parts.append(f"{item['date']} → aucune donnée")

    return "\n".join(parts)

# -----------------------------
# GEMINI CALL
# -----------------------------

def call_gemini(question, context_text):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY manquant dans .env")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"""
{SYSTEM_PROMPT}

Contexte :
{context_text}

Question :
{question}
"""
                    }
                ]
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload, timeout=20)
    response.raise_for_status()

    data = response.json()

    return data["candidates"][0]["content"]["parts"][0]["text"]

# -----------------------------
# MAIN LOGIC
# -----------------------------

def call_model(question, context_text):
    return call_gemini(question, context_text)


@assistant_bp.route('/assistant', methods=['POST'])
def assistant():
    payload = request.get_json() or {}
    question = payload.get('question', '').strip()

    if not question:
        return jsonify({'error': 'Question requise.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        latest_temp = fetch_latest_temperature(cursor)
        latest_humidity = fetch_latest_humidity(cursor)
        forecast_summary = fetch_forecast_summary(cursor)
    finally:
        conn.close()

    context_text = build_context(latest_temp, latest_humidity, forecast_summary)

    try:
        answer = call_model(question, context_text)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'question': question,
        'answer': answer
    })