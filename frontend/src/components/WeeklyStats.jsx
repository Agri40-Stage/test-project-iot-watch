import React, { useState, useEffect } from 'react';
import { fetchWeeklyStats, fetchWeeklyCharts } from '../api/weekly';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Title);

const WeeklyStats = () => {
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

    const getWeeklyCharts = async () => {
        try {
            const data = await fetchWeeklyCharts();
            if (data && data.heatmap_path && data.trend_chart_path) {
                setChartPaths(data);
            }
        } catch (err) {
            console.error("Error getting weekly charts: ", err);
        }
    };

    useEffect(() => {
        getWeeklyStats();
        getWeeklyCharts();
        const interval = setInterval(() => {
            getWeeklyStats();
            getWeeklyCharts();
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

            {chartPaths && !loading && (
                <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300">
                    <h2 className="text-xl font-medium">Advanced Visualizations</h2>
                    
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-medium">Temperature Heatmap</h3>
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${chartPaths.heatmap_path}`}
                                alt="Weekly temperature heatmap"
                                className="w-full rounded-lg border border-gray-200"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.png';
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-medium">Daily Trends</h3>
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${chartPaths.trend_chart_path}`}
                                alt="Weekly temperature trends"
                                className="w-full rounded-lg border border-gray-200"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.png';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyStats;
