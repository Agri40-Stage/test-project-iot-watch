import sqlite3
import os
from datetime import datetime, timedelta
import numpy as np

# --- MODIFICATION ICI : On neutralise TensorFlow pour éviter l'erreur DLL ---
# from tensorflow.keras.models import load_model 
# --------------------------------------------------------------------------

BASE_TEMP = 25.0
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'temperature.db')
    # Créer le dossier database s'il n'existe pas
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def generate_mock_data(clear_existing=True):
    """Génère des données de test pour remplir les graphiques"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
    
    base_time = datetime.now() - timedelta(days=7)
    for i in range(168):
        timestamp = (base_time + timedelta(hours=i)).isoformat()
        temperature = BASE_TEMP + np.random.normal(0, 2)
        cursor.execute('''
        INSERT INTO temperature_data (timestamp, temperature, latitude, longitude)
        VALUES (?, ?, ?, ?)
        ''', (timestamp, temperature, DEFAULT_LATITUDE, DEFAULT_LONGITUDE))
    
    conn.commit()
    conn.close()
    print("✅ Données simulées générées avec succès")

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_date TEXT NOT NULL,
        target_date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        UNIQUE(target_date, hour, latitude, longitude)
    )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_target_date ON temperature_predictions(target_date)')
    
    conn.commit()
    
    cursor.execute('SELECT COUNT(*) FROM temperature_data')
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("La base est vide. Population en cours...")
        conn.close()
        generate_mock_data()
    else:
        conn.close()
        purge_old_data()

def purge_old_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    cursor.execute('DELETE FROM temperature_data WHERE timestamp < ?', (threshold_date,))
    
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('DELETE FROM temperature_predictions WHERE prediction_date < ?', (prediction_threshold,))
    
    conn.commit()
    conn.close()

# --- MODIFICATION ICI : On simule le chargement du modèle ---
def load_prediction_model():
    """Version simulée qui accepte tous les arguments (comme verbose)"""
    print("⚠️ Mode simulation : TensorFlow est désactivé. Acceptation des arguments flexible.")
    
    class FakeModel:
        # On ajoute *args et **kwargs pour attraper 'verbose' et autres paramètres
        def predict(self, data, *args, **kwargs):
            # Retourne une température simulée réaliste
            # On génère un tableau de 24 valeurs (une par heure)
            return np.random.uniform(18, 28, size=(len(data), 1))
            
    return FakeModel()
# -----------------------------------------------------------

def standardize_timestamp(timestamp):
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            dt = timestamp
        return dt.strftime('%Y-%m-%d %H:%M')
    except:
        return datetime.now().strftime('%Y-%m-%d %H:%M')