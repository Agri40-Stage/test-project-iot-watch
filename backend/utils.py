from datetime import datetime

#  Temperature conversions
def celsius_to_fahrenheit(celsius):
    return round((celsius * 9 / 5) + 32, 2)

def fahrenheit_to_celsius(fahrenheit):
    return round((fahrenheit - 32) * 5 / 9, 2)

#  Trend analysis
def trend_from_diff(diff, threshold=0.5):
    if diff > threshold:
        return "rising"
    elif diff < -threshold:
        return "falling"
    return "stable"

def trend_to_icon(trend):
    return {
        "rising": "📈",
        "falling": "📉",
        "stable": "➖"
    }.get(trend, "❓")

#  Time utilities
def format_time(iso_string):
    """Convert ISO timestamp to readable 'HH:MM' format."""
    return datetime.fromisoformat(iso_string).strftime("%H:%M")

def now_iso():
    """Current time in ISO 8601 format."""
    return datetime.now().isoformat()
