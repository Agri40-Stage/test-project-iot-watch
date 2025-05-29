import numpy as np
import os
from datetime import datetime
from models import get_db_connection

def get_weekly_chart_data():
    """Fetches and processes weekly temperature data for Chart.js."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT
                strftime('%Y-%m-%d', timestamp) as day,
                strftime('%H', timestamp) as hour,
                AVG(temperature) as avg_temp
            FROM temperature_data
            WHERE timestamp >= datetime('now', '-7 days')
            GROUP BY strftime('%Y-%m-%d', timestamp), strftime('%H', timestamp)
            ORDER BY day, hour
        ''')
        results = cursor.fetchall()
        conn.close()

        if not results:
            return {'error': 'No data found for the last 7 days.'}

        # Process data for heatmap (matrix)
        days = sorted(list(set(row['day'] for row in results)))
        hours = [f"{h:02d}" for h in range(24)]
        data_matrix = np.full((len(days), 24), np.nan)
        day_indices = {day: i for i, day in enumerate(days)}

        for row in results:
            day_idx = day_indices.get(row['day'])
            hour_idx = int(row['hour'])
            if day_idx is not None:
                data_matrix[day_idx, hour_idx] = round(row['avg_temp'], 1) # Round for cleaner display

        # Process data for trend chart
        # Use np.nanmean, np.nanmin, np.nanmax to handle potential missing hours
        daily_avg = np.nanmean(data_matrix, axis=1)
        daily_min = np.nanmin(data_matrix, axis=1)
        daily_max = np.nanmax(data_matrix, axis=1)

        # Replace NaN results (if a whole day has no data) with None for JSON compatibility
        daily_avg = [x if not np.isnan(x) else None for x in daily_avg]
        daily_min = [x if not np.isnan(x) else None for x in daily_min]
        daily_max = [x if not np.isnan(x) else None for x in daily_max]
        
        # Prepare heatmap data for Chart.js (e.g., for chartjs-chart-matrix plugin)
        # Structure: [{x: hour, y: day, v: temperature}]
        heatmap_chartjs_data = []
        for r, day in enumerate(days):
            for c, hour in enumerate(hours):
                value = data_matrix[r, c]
                if not np.isnan(value):
                    heatmap_chartjs_data.append({'x': hour, 'y': day, 'v': value})

        return {
            'days': days,
            'hours': hours,
            'heatmap_data': heatmap_chartjs_data, # Data structured for matrix/heatmap chart
            'trend_data': {
                'avg': daily_avg,
                'min': daily_min,
                'max': daily_max
            }
        }

    except Exception as e:
        print(f"Error getting weekly chart data: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}
