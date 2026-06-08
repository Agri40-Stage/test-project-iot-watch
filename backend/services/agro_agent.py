import json
import os
import requests
import numpy as np
from datetime import datetime, timedelta
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_crop_knowledge():
    with open("crop_knowledge.json", "r") as f:
        return json.load(f)

def get_recent_temperatures(hours=24):
    conn = get_db_connection()
    cursor = conn.cursor()
    threshold = (datetime.now() - timedelta(hours=hours)).isoformat()
    cursor.execute('''
        SELECT timestamp, temperature FROM temperature_data
        WHERE timestamp >= ? AND latitude = ? AND longitude = ?
        ORDER BY timestamp ASC
    ''', (threshold, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
    rows = cursor.fetchall()
    conn.close()
    return [{"time": r["timestamp"], "temp": round(r["temperature"], 2)} for r in rows]

def detect_anomalies(readings):
    if len(readings) < 5:
        return []
    temps = np.array([r["temp"] for r in readings])
    mean = np.mean(temps)
    std = np.std(temps)
    anomalies = []
    for r in readings:
        z = abs(r["temp"] - mean) / std if std > 0 else 0
        if z > 2:
            anomalies.append({
                "time": r["time"],
                "temp": r["temp"],
                "z_score": round(z, 2),
                "deviation": round(r["temp"] - mean, 2)
            })
    return anomalies

def retrieve_crop_rules(crop, current_temp):
    knowledge = load_crop_knowledge()
    for entry in knowledge:
        if entry["crop"].lower() == crop.lower():
            triggered = []
            for risk in entry["risks"]:
                condition = risk["condition"].replace("temp", str(current_temp))
                try:
                    if eval(condition):
                        triggered.append(risk)
                except:
                    pass
            return triggered
    return []

def build_system_prompt(crop, readings, anomalies, triggered_rules):
    temps = [r["temp"] for r in readings]
    summary = {
        "period": f"Last {len(readings)} readings",
        "min": round(min(temps), 2) if temps else None,
        "max": round(max(temps), 2) if temps else None,
        "avg": round(sum(temps) / len(temps), 2) if temps else None,
        "current": temps[-1] if temps else None,
        "anomalies_detected": len(anomalies)
    }
    prompt = f"""You are an agricultural IoT assistant for Agri 4.0.
Answer the user's question based ONLY on the provided data.

SENSOR SUMMARY (last 24h):
- Current temperature: {summary['current']}°C
- Min: {summary['min']}°C | Max: {summary['max']}°C | Avg: {summary['avg']}°C
- Anomalies detected: {summary['anomalies_detected']}

ANOMALY DETAILS:
{json.dumps(anomalies, indent=2) if anomalies else 'No anomalies detected.'}

CROP: {crop}

AGRONOMIC RISK RULES TRIGGERED:
{json.dumps(triggered_rules, indent=2) if triggered_rules else 'No active risks for current temperature.'}

Provide a concise, actionable farming insight (under 150 words). Reference actual temperatures."""
    return prompt

def ask_agent(crop, question, conversation_history=None):
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    readings = get_recent_temperatures(hours=24)
    anomalies = detect_anomalies(readings)
    current_temp = readings[-1]["temp"] if readings else 20
    triggered_rules = retrieve_crop_rules(crop, current_temp)
    system_prompt = build_system_prompt(crop, readings, anomalies, triggered_rules)
    
    messages = conversation_history or []
    messages.append({"role": "user", "content": question})
    
    if not GROQ_API_KEY:
        return {
            "answer": "GROQ_API_KEY not set in .env. Please add your key from console.groq.com",
            "anomalies": anomalies,
            "triggered_rules": triggered_rules,
            "current_temp": current_temp,
            "history": messages
        }
    
    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "system", "content": system_prompt}] + messages,
                "max_tokens": 400,
                "temperature": 0.7
            },
            timeout=30
        )
        if response.status_code == 200:
            answer = response.json()["choices"][0]["message"]["content"]
        else:
            answer = f"Groq API error: {response.status_code} - {response.text}"
    except Exception as e:
        answer = f"Error calling Groq: {str(e)}"
    
    messages.append({"role": "assistant", "content": answer})
    return {
        "answer": answer,
        "anomalies": anomalies,
        "triggered_rules": triggered_rules,
        "current_temp": current_temp,
        "history": messages
    }