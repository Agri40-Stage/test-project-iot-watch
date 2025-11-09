from .connection import get_db_connection
from .maintenance import generate_mock_data, purge_old_data

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
    conn.close()
    if count == 0:
        print("Database is empty. Populating with mock data...")
        generate_mock_data()
    else:
        purge_old_data()