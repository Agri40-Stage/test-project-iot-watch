import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime
from models import get_db_connection
import seaborn as sns

def generate_weekly_chart():
    try:
        # Create directory for saving charts
        charts_dir = os.path.join(os.path.dirname(__file__), '../static/charts')
        os.makedirs(charts_dir, exist_ok=True)

        # Connect to database and fetch temperature data
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

        # Prepare data structure
        days = sorted(list(set(row['day'] for row in results)))
        hours = [f"{h:02d}" for h in range(24)]  # 24-hour format with leading zeros

        # Initialize data matrix with NaN values
        data = np.zeros((len(days), 24))
        data.fill(np.nan)
        day_indices = {day: i for i, day in enumerate(days)}

        # Populate data matrix
        for row in results:
            day_idx = day_indices[row['day']]
            hour_idx = int(row['hour'])
            data[day_idx, hour_idx] = row['avg_temp']

        # Set global style parameters
        sns.set_style("whitegrid")
        plt.rcParams.update({
            'font.size': 11,
            'axes.labelsize': 13,
            'axes.titlesize': 15,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10
        })

        # ----------------------------
        # HEATMAP VISUALIZATION
        # ----------------------------
        plt.figure(figsize=(13, 8))
        masked_data = np.ma.masked_invalid(data)
        heatmap = plt.pcolormesh(masked_data, cmap='coolwarm', edgecolors='w', linewidth=0.3, vmin=10, vmax=30)
        
        # Add colorbar
        cbar = plt.colorbar(heatmap, shrink=0.9, aspect=30, pad=0.02)
        cbar.set_label('Temperature (°C)', fontsize=12)

        # Configure axes
        plt.yticks(np.arange(0.5, len(days)), days)
        plt.xticks(np.arange(0.5, 24), hours)
        plt.xlabel('Hour of Day')
        plt.ylabel('Date')
        plt.title('Hourly Temperature Heatmap (Last 7 Days)', pad=15)

        # Add temperature values to heatmap cells
        for i in range(len(days)):
            for j in range(24):
                if not np.isnan(data[i, j]):
                    color = "white" if 15 <= data[i, j] <= 25 else "black"
                    plt.text(j + 0.5, i + 0.5, f"{data[i, j]:.1f}", 
                            ha="center", va="center", 
                            color=color, fontsize=8)

        plt.tight_layout()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        chart_path = os.path.join(charts_dir, f'weekly_heatmap_{timestamp}.png')
        plt.savefig(chart_path, dpi=150)
        plt.close()

        # ----------------------------
        # LINE CHART VISUALIZATION
        # ----------------------------
        plt.figure(figsize=(13, 6))
        
        # Calculate daily statistics
        daily_avg = np.nanmean(data, axis=1)
        daily_min = np.nanmin(data, axis=1)
        daily_max = np.nanmax(data, axis=1)

        # Plot temperature trends
        plt.plot(days, daily_avg, 'o-', label='Average', color='#ff811f', linewidth=2.5, markerfacecolor='white')
        plt.plot(days, daily_min, 's--', label='Minimum', color='#1f77b4', alpha=0.8)
        plt.plot(days, daily_max, 's--', label='Maximum', color='crimson', alpha=0.8)

        # Add shaded area between min and max
        plt.fill_between(days, daily_min, daily_max, alpha=0.1, color='gray')

        # Configure chart appearance
        plt.xlabel('Date')
        plt.ylabel('Temperature (°C)')
        plt.title('Daily Temperature Trends', pad=15)
        plt.grid(True, linestyle='--', linewidth=0.5, alpha=0.6)
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()

        # Save line chart
        trend_chart_path = os.path.join(charts_dir, f'weekly_trend_{timestamp}.png')
        plt.savefig(trend_chart_path, dpi=150)
        plt.close()

        return {
            'heatmap_path': f'/static/charts/weekly_heatmap_{timestamp}.png',
            'trend_chart_path': f'/static/charts/weekly_trend_{timestamp}.png'
        }

    except Exception as e:
        print(f"Error generating weekly chart: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}