import sqlite3
import os

def get_db_connection():
    # This path navigates from this file (in db/) up to backend/ and then into instance/
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance', 'temperature.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn