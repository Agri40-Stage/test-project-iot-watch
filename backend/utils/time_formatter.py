from datetime import datetime

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