from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Autorise les appels frontend -> backend

DATABASE = 'temperature.db'

# ✅ Fonction : Création de la table si elle n'existe pas
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS temperature_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            temperature REAL
        )
    ''')
    conn.commit()
    conn.close()

# ✅ Fonction : Récupérer la température depuis Open-Meteo
def fetch_temperature():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 48.8566,          # Exemple : Paris
        "longitude": 2.3522,
        "current_weather": True
    }
    response = requests.get(url, params=params)
    data = response.json()
    temperature = data['current_weather']['temperature']
    return temperature

# ✅ Route : Récupérer et enregistrer la température
@app.route('/api/fetch-and-save', methods=['GET'])
def fetch_and_save():
    try:
        temp = fetch_temperature()
        timestamp = datetime.now().isoformat()

        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO temperature_data (timestamp, temperature) VALUES (?, ?)', (timestamp, temp))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "temperature": temp, "timestamp": timestamp})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# ✅ Route : Voir les 10 dernières températures
@app.route('/api/latest', methods=['GET'])
def get_latest():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM temperature_data ORDER BY timestamp DESC LIMIT 10')
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row["id"],
            "timestamp": row["timestamp"],
            "temperature": row["temperature"]
        })

    return jsonify(result)

# ✅ Lancer l'app Flask
if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
