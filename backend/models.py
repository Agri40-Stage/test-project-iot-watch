import sqlite3
import os
from datetime import datetime, timedelta
import numpy as np
from tensorflow.keras.models import load_model
from werkzeug.security import generate_password_hash, check_password_hash

BASE_TEMP = 25.0
DEFAULT_LATITUDE = 30.4202
DEFAULT_LONGITUDE = -9.5982

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'temperature.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def generate_mock_data(clear_existing=True):
    """Generate mock temperature data for testing"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if clear_existing:
        cursor.execute('DELETE FROM temperature_data')
    
    # Generate data for the last 7 days
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
    print("Mock data generated successfully")

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

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    ensure_user_schema(conn)
    
    # Create index for faster querying
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_target_date ON temperature_predictions(target_date)')
    
    conn.commit()
    
    cursor.execute('SELECT COUNT(*) FROM temperature_data')
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("Database is empty. Populating with mock data...")
        conn.close()
        generate_mock_data()
    else:
        conn.close()
        purge_old_data()

def ensure_user_schema(conn):
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not cursor.fetchone():
        return

    cursor.execute("PRAGMA table_info(users)")
    columns = {row["name"] for row in cursor.fetchall()}

    if "email" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
    if "full_name" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")

    if "username" in columns:
        cursor.execute("UPDATE users SET email = COALESCE(email, username)")
        cursor.execute("UPDATE users SET full_name = COALESCE(full_name, username)")
    else:
        cursor.execute("UPDATE users SET email = COALESCE(email, 'unknown@example.com') WHERE email IS NULL OR email = ''")
        cursor.execute("UPDATE users SET full_name = COALESCE(full_name, 'User') WHERE full_name IS NULL OR full_name = ''")

    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)")

def create_user(email, password, full_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = {row["name"] for row in cursor.fetchall()}
        password_hash = generate_password_hash(password)
        created_at = datetime.now().isoformat()
        if "username" in columns:
            cursor.execute('''
            INSERT INTO users (username, email, full_name, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
            ''', (email, email, full_name, password_hash, created_at))
        else:
            cursor.execute('''
            INSERT INTO users (email, full_name, password_hash, created_at)
            VALUES (?, ?, ?, ?)
            ''', (email, full_name, password_hash, created_at))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def verify_user(email, password):
    user = get_user_by_email(email)
    if not user:
        return None
    if check_password_hash(user['password_hash'], password):
        return user
    return None

def purge_old_data():
    """Purge data older than 10 days"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Keep data for 10 days instead of 7
    threshold_date = (datetime.now() - timedelta(days=10)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_data
    WHERE timestamp < ?
    ''', (threshold_date,))
    
    # Delete predictions older than 5 days
    prediction_threshold = (datetime.now() - timedelta(days=5)).isoformat()
    cursor.execute('''
    DELETE FROM temperature_predictions
    WHERE prediction_date < ?
    ''', (prediction_threshold,))
    
    conn.commit()
    conn.close()
    print(f"Purged data older than {threshold_date}")

def load_prediction_model():
    """Load the Keras prediction model (cached version)"""
    
    # Define possible model paths
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    possible_paths = [
        os.path.join(model_dir, 'ml.keras'),
        os.path.join(os.path.dirname(__file__), 'ml.keras')
    ]
    
    print(f"Attempting to load model from possible paths:")
    for path in possible_paths:
        print(f"Checking path: {path}")
        print(f"Path exists: {os.path.exists(path)}")
    
    # Try each possible path
    for model_path in possible_paths:
        try:
            if os.path.exists(model_path):
                print(f"Loading model from: {model_path}")
                model = load_model(model_path, compile=False)
                print(f"Successfully loaded Keras model from {model_path} (cached)")
                return model
            else:
                print(f"Model file not found at: {model_path}")
        except Exception as e:
            print(f"Error loading model from {model_path}:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
    
    raise ValueError("Could not load the prediction model from any of the specified paths")

def standardize_timestamp(timestamp):
    """Convert any timestamp to YYYY-MM-DD HH:MM format"""
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            dt = timestamp
        return dt.strftime('%Y-%m-%d %H:%M')
    except:
        return datetime.now().strftime('%Y-%m-%d %H:%M')
