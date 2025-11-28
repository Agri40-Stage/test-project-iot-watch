from .connection import get_db_connection
from .maintenance import generate_mock_data, purge_old_data

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Temperature Data Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS temperature_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')
    
    # Humidity Data Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS humidity_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        humidity REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')

    # Temperature Predictions Table 
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
    
    #  Create Indexes for Faster Querying 
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON temperature_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_humidity_timestamp ON humidity_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_target_date ON temperature_predictions(target_date)')
    
    conn.commit()
    
    #  Check if database is empty and populate if necessary 
    cursor.execute('SELECT COUNT(*) FROM temperature_data')
    temp_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM humidity_data')
    humidity_count = cursor.fetchone()[0]
    
    conn.close()
    
    # If either table is empty, generate mock data for both
    if temp_count == 0 or humidity_count == 0:
        print("Database is missing data. Populating with mock data...")
        # We will need to update generate_mock_data to handle humidity as well
        generate_mock_data()
    else:
        purge_old_data()