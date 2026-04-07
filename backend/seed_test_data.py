import random
import numpy as np
from datetime import datetime, timedelta
from models import get_db_connection, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def seed_temperature_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    now = datetime.now()
    records = []

    for i in range(200):
        timestamp = now - timedelta(minutes=i * 5)
        hour = timestamp.hour

        # Realistic daily cycle
        base_temp = 19.0 + 6.0 * np.sin(np.pi * (hour - 6) / 12)
        noise = random.uniform(-0.5, 0.5)
        temperature = base_temp + noise

        # Inject anomalies at specific points
        if i in [20, 50, 100, 150]:
            temperature += random.choice([8, -7, 10, -9])

        records.append((
            timestamp.isoformat(),
            round(temperature, 2),
            DEFAULT_LATITUDE,
            DEFAULT_LONGITUDE
        ))

    cursor.executemany('''
        INSERT OR IGNORE INTO temperature_data (timestamp, temperature, latitude, longitude)
        VALUES (?, ?, ?, ?)
    ''', records)

    conn.commit()
    conn.close()
    print(f"✅ Inserted {len(records)} temperature records with anomalies")

if __name__ == "__main__":
    seed_temperature_data()