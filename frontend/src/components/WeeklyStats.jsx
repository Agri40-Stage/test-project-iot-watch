import React, { useState, useEffect } from 'react';
import { fetchWeeklyStats, fetchWeeklyChartData } from '../api/weekly';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  MatrixController,
  MatrixElement
);

const WeeklyStats = () => {
    const [weeklyChartData, setWeeklyChartData] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [chartPaths, setChartPaths] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10
                }
            },
            title: {
                display: true,
                text: 'Weekly Temperature Trends',
                font: {
                    size: 18
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw} °C`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Day'
                },
                grid: {
                    display: false
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                },
                grid: {
                    color: '#e5e7eb'
                }
            }
        }
    };

    // Configuration for the heatmap
    const heatmapOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    title() {
                        return '';
                    },
                    label(context) {
                        const v = context.dataset.data[context.dataIndex];
                        return [`Date: ${v.y}`, `Hour: ${v.x}h`, `Temperature: ${v.v.toFixed(1)}°C`];
                    }
                }
            },
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Hourly Temperature Heatmap (Last 7 Days)',
                font: {
                    size: 16
                }
            }
        },
        scales: {
            y: {
                type: 'category',
                offset: true,
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            x: {
                type: 'category',
                offset: true,
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Hour',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    };

    
    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            tooltip: {
                usePointStyle: true
            },
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10
                }
            },
            title: {
                display: true,
                text: 'Daily Temperature Trends',
                font: {
                    size: 16
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                    font: {
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 0.5
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        weight: 'bold'
                    }
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    const getWeeklyStats = async () => {
        try {
            setLoading(true);
            const data = await fetchWeeklyStats();
            if (!data || !data.days || !data.avg_temps || !data.min_temps || !data.max_temps) {
                throw new Error("Incomplete data received from server");
            }
            setWeeklyStats(data);

            setChartData({
                labels: data.days,
                datasets: [
                    {
                        label: 'Average temperature',
                        data: data.avg_temps,
                        borderColor: '#fb923c',
                        backgroundColor: 'rgba(251, 146, 60, 0.2)',
                        type: 'line',
                        tension: 0.4,
                        pointBackgroundColor: '#fb923c',
                        pointBorderColor: '#fb923c',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Minimum temperature',
                        data: data.min_temps,
                        backgroundColor: '#60a5fa',
                        borderRadius: 5,
                        barThickness: 20,
                        type: 'bar',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Maximum temperature',
                        data: data.max_temps,
                        backgroundColor: '#f87171',
                        borderRadius: 5,
                        barThickness: 20,
                        type: 'bar',
                        yAxisID: 'y'
                    }
                ]
            });

            setError(null);
        } catch (err) {
            setError(err.message || "Failed to fetch weekly statistics");
        } finally {
            setLoading(false);
        }
    };

    const getWeeklyChartData = async () => {
        try {
            const data = await fetchWeeklyChartData();
            if (data && !data.error) {
                setWeeklyChartData(data);
            }
        } catch (err) {
            console.error("Error getting weekly chart data: ", err);
        }
    };

    useEffect(() => {
        getWeeklyStats();
        getWeeklyChartData();
        const interval = setInterval(() => {
            getWeeklyStats();
            getWeeklyChartData();
        }, 3600000);
        return () => clearInterval(interval);
    }, []);

    const hasValidStatsData = weeklyStats && 
                            weeklyStats.days && 
                            weeklyStats.avg_temps && 
                            weeklyStats.min_temps && 
                            weeklyStats.max_temps &&
                            weeklyStats.weekly_avg !== undefined &&
                            weeklyStats.temp_std_dev !== undefined;

    const minTempValue = hasValidStatsData && weeklyStats.min_temps.length > 0 
                        ? Math.min(...weeklyStats.min_temps) 
                        : 'N/A';
    
    const maxTempValue = hasValidStatsData && weeklyStats.max_temps.length > 0 
                        ? Math.max(...weeklyStats.max_temps) 
                        : 'N/A';

    return (
        <div className="flex flex-col gap-8 py-12 px-6">
            <div className="w-full flex flex-col gap-2 text-left">
                <h1 className="font-bold text-3xl">
                    Weekly Temperature Statistics
                </h1>
                <p className="text-sm font-light text-gray-400">
                    Temperature trend analysis for the last 7 days
                </p>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && !hasValidStatsData && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>No valid data available to display statistics</p>
                </div>
            )}

            {hasValidStatsData && (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
                        <h2 className="text-xl font-medium">Weekly Summary</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Average temperature</span>
                                <span className="text-2xl font-bold">{weeklyStats.weekly_avg.toFixed(1)}°C</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Standard deviation</span>
                                <span className="text-2xl font-bold">{weeklyStats.temp_std_dev.toFixed(1)}°C</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Minimum temperature</span>
                                <span className="text-2xl font-bold">{minTempValue}°C</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Maximum temperature</span>
                                <span className="text-2xl font-bold">{maxTempValue}°C</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
                        <h2 className="text-xl font-medium">Temperature Trends</h2>
                        <div className="h-80">
                            <Chart type="bar" data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            )}

            {weeklyChartData && !loading && (
                <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
                    <h2 className="text-xl font-medium">Advanced Visualizations</h2>
                    
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-medium">Temperature Heatmap</h3>
                            <div className="h-80 w-full rounded-lg border border-gray-200 p-4">
                                {weeklyChartData.heatmap_data && weeklyChartData.heatmap_data.length > 0 ? (
                                    <Chart 
                                        type="matrix"
                                        data={{
                                            datasets: [{
                                                label: 'Hourly temperature',
                                                data: weeklyChartData.heatmap_data,
                                                backgroundColor(context) {
                                                    const value = context.dataset.data[context.dataIndex].v;
                                                    const alpha = 1;
                                                    
                                                    // Color scale similar to matplotlib's coolwarm
                                                    if (value < 15) {
                                                        // Blue (cold) for low values
                                                        const intensity = Math.max(0, (value - 10) / 5);
                                                        return `rgba(${59 + 196 * intensity}, ${76 + 179 * intensity}, ${192}, ${alpha})`;
                                                    } else if (value > 25) {
                                                        // Red (hot) for high values
                                                        const intensity = Math.min(1, (value - 25) / 5);
                                                        return `rgba(${215 + 40 * intensity}, ${48 + 40 * intensity}, ${39}, ${alpha})`;
                                                    } else {
                                                        // White/neutral for medium values
                                                        const intensity = (value - 15) / 10;
                                                        return `rgba(${255 - 40 * intensity}, ${255 - 207 * intensity}, ${255 - 216 * intensity}, ${alpha})`;
                                                    }
                                                },
                                                borderColor: 'white',
                                                borderWidth: 1,
                                                width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
                                                height: ({ chart }) => (chart.chartArea || {}).height / weeklyChartData.days.length - 1
                                            }]
                                        }}
                                        options={{
                                            ...heatmapOptions,
                                            scales: {
                                                ...heatmapOptions.scales,
                                                y: {
                                                    ...heatmapOptions.scales.y,
                                                    labels: weeklyChartData.days
                                                },
                                                x: {
                                                    ...heatmapOptions.scales.x,
                                                    labels: weeklyChartData.hours
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <p className="text-gray-500">No heatmap data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-medium">Daily Trends</h3>
                            <div className="h-80 w-full rounded-lg border border-gray-200 p-4">
                                {weeklyChartData.days && weeklyChartData.trend_data ? (
                                    <Chart 
                                        type="line"
                                        data={{
                                            labels: weeklyChartData.days,
                                            datasets: [
                                                {
                                                    label: 'Average',
                                                    data: weeklyChartData.trend_data.avg,
                                                    borderColor: '#ff811f',
                                                    backgroundColor: 'rgba(255, 129, 31, 0.1)',
                                                    borderWidth: 2.5,
                                                    pointBackgroundColor: 'white',
                                                    pointBorderColor: '#ff811f',
                                                    pointRadius: 5,
                                                    pointHoverRadius: 7,
                                                    tension: 0.3
                                                },
                                                {
                                                    label: 'Minimum',
                                                    data: weeklyChartData.trend_data.min,
                                                    borderColor: '#1f77b4',
                                                    borderWidth: 1.5,
                                                    borderDash: [5, 5],
                                                    pointStyle: 'rect',
                                                    pointRadius: 4,
                                                    pointHoverRadius: 6,
                                                    tension: 0.3
                                                },
                                                {
                                                    label: 'Maximum',
                                                    data: weeklyChartData.trend_data.max,
                                                    borderColor: 'crimson',
                                                    borderWidth: 1.5,
                                                    borderDash: [5, 5],
                                                    pointStyle: 'rect',
                                                    pointRadius: 4,
                                                    pointHoverRadius: 6,
                                                    tension: 0.3
                                                },
                                                {
                                                    label: 'Range',
                                                    data: weeklyChartData.trend_data.min,
                                                    borderColor: 'transparent',
                                                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                                                    pointRadius: 0,
                                                    pointHoverRadius: 0,
                                                    fill: '+1', // Fill up to the next dataset (max)
                                                }
                                            ]
                                        }}
                                        options={trendOptions}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <p className="text-gray-500">No trend data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyStats;
