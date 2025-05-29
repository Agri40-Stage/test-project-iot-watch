import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime
from models import get_db_connection
import seaborn as sns

def generate_weekly_chart():
    try:
        charts_dir = os.path.join(os.path.dirname(__file__), '../static/charts')
        os.makedirs(charts_dir, exist_ok=True)

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

        days = sorted(list(set(row['day'] for row in results)))
        hours = [f"{h:02d}" for h in range(24)]
        data = np.full((len(days), 24), np.nan)
        day_indices = {day: i for i, day in enumerate(days)}

        for row in results:
            day_idx = day_indices[row['day']]
            hour_idx = int(row['hour'])
            data[day_idx, hour_idx] = row['avg_temp']

        sns.set_style("whitegrid")
        plt.rcParams.update({
            'font.size': 11,
            'axes.labelsize': 13,
            'axes.titlesize': 15,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10
        })

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        # ----------------------------
        # HEATMAP
        # ----------------------------
        fig1, ax1 = plt.subplots(figsize=(12, 6))
        masked_data = np.ma.masked_invalid(data)
        cmap = plt.get_cmap('coolwarm')
        heatmap = ax1.pcolormesh(masked_data, cmap=cmap, edgecolors='w', linewidth=0.3, vmin=10, vmax=30)

        cbar = fig1.colorbar(heatmap, ax=ax1, shrink=0.85, aspect=30, pad=0.02)
        cbar.set_label('Temperature (C)', fontsize=12)

        ax1.set_yticks(np.arange(0.5, len(days)))
        ax1.set_yticklabels(days)
        ax1.set_xticks(np.arange(0.5, 24))
        ax1.set_xticklabels(hours)
        ax1.set_xlabel('Hour of Day')
        ax1.set_ylabel('Date')
        ax1.set_title('Hourly Temperature Heatmap (Last 7 Days)', pad=15)

        for i in range(len(days)):
            for j in range(24):
                if not np.isnan(data[i, j]):
                    color = "white" if 15 <= data[i, j] <= 25 else "black"
                    ax1.text(j + 0.5, i + 0.5, f"{data[i, j]:.1f}", ha="center", va="center", color=color, fontsize=7)

        fig1.tight_layout()
        heatmap_path = os.path.join(charts_dir, f'weekly_heatmap_{timestamp}.png')
        fig1.savefig(heatmap_path, dpi=200)
        plt.close(fig1)

        # ----------------------------
        # LINE CHART
        # ----------------------------
        fig2, ax2 = plt.subplots(figsize=(12, 6))
        daily_avg = np.nanmean(data, axis=1)
        daily_min = np.nanmin(data, axis=1)
        daily_max = np.nanmax(data, axis=1)

        ax2.plot(days, daily_avg, 'o-', label='Average', color='#ff811f', linewidth=2.5, markerfacecolor='white')
        ax2.plot(days, daily_min, 's--', label='Minimum', color='#1f77b4', alpha=0.8)
        ax2.plot(days, daily_max, 's--', label='Maximum', color='crimson', alpha=0.8)
        ax2.fill_between(days, daily_min, daily_max, alpha=0.1, color='gray')

        ax2.set_xlabel('Date')
        ax2.set_ylabel('Temperature (C)')
        ax2.set_title('Daily Temperature Trends', pad=15)
        ax2.grid(True, linestyle='--', linewidth=0.5, alpha=0.6)
        ax2.legend()
        ax2.tick_params(axis='x', rotation=45)
        fig2.tight_layout()

        trend_chart_path = os.path.join(charts_dir, f'weekly_trend_{timestamp}.png')
        fig2.savefig(trend_chart_path, dpi=200)
        plt.close(fig2)

        return {
            'heatmap_path': f'/static/charts/weekly_heatmap_{timestamp}.png',
            'trend_chart_path': f'/static/charts/weekly_trend_{timestamp}.png'
        }

    except Exception as e:
        print(f"Error generating weekly chart: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}
