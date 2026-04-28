import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Header from '../components/Header';
import { API_BASE_URL } from '../config';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Helper to get initial dark mode state
const getInitialDark = () => {
    if (localStorage.getItem('theme')) {
        return localStorage.getItem('theme') === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

function Stats() {
    const [weeklyData, setWeeklyData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDark, setIsDark] = useState(getInitialDark());

    // Listen for dark mode toggle
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.body.classList.contains('dark'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/weekly-stats`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setWeeklyData(data);

            // Calculate global summary from all days
            const allMin = data.minTemps.filter((v) => v !== null);
            const allMax = data.maxTemps.filter((v) => v !== null);
            const allAvg = data.avgTemps.filter((v) => v !== null);

            setSummary({
                globalMin: allMin.length ? Math.min(...allMin).toFixed(1) : '--',
                globalMax: allMax.length ? Math.max(...allMax).toFixed(1) : '--',
                globalAvg: allAvg.length
                    ? (allAvg.reduce((a, b) => a + b, 0) / allAvg.length).toFixed(1)
                    : '--',
            });

            setError(null);
        } catch (err) {
            setError(`Impossible de charger les statistiques : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: isDark ? '#f1f5f9' : '#1f2937',
                    font: { size: 12, weight: '500' },
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#23272a' : '#fff',
                titleColor: isDark ? '#f1f5f9' : '#1f2937',
                bodyColor: isDark ? '#f1f5f9' : '#1f2937',
                borderColor: isDark ? '#444' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}°C`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: isDark ? '#333' : '#e5e7eb' },
                ticks: { color: isDark ? '#f1f5f9' : '#6b7280', font: { size: 11 } },
            },
            y: {
                grid: { color: isDark ? '#333' : '#e5e7eb' },
                ticks: {
                    color: isDark ? '#f1f5f9' : '#6b7280',
                    font: { size: 11 },
                    callback: (value) => value + '°C',
                },
                title: {
                    display: true,
                    text: 'Température (°C)',
                    color: isDark ? '#f1f5f9' : '#6b7280',
                    font: { size: 12, weight: '500' },
                },
            },
        },
    };

    const chartData = weeklyData
        ? {
            labels: weeklyData.dates,
            datasets: [
                {
                    type: 'bar',
                    label: 'Min',
                    data: weeklyData.minTemps,
                    backgroundColor: 'rgba(53, 162, 235, 0.7)',
                    borderRadius: 4,
                },
                {
                    type: 'bar',
                    label: 'Max',
                    data: weeklyData.maxTemps,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderRadius: 4,
                },
                {
                    type: 'line',
                    label: 'Moyenne',
                    data: weeklyData.avgTemps,
                    borderColor: '#ff811f',
                    backgroundColor: 'rgba(255, 129, 31, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ff811f',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        }
        : null;

    return (
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
            <Header />

            <div className="flex flex-col gap-8 py-12 px-6">
                {/* Page title */}
                <div className="w-full flex flex-col gap-2 text-left">
                    <h1 className="font-bold text-3xl">Statistiques de Température</h1>
                    <p className="text-sm font-light text-gray-400">
                        Moyenne, minimum et maximum sur les 7 derniers jours
                    </p>
                </div>

                {/* Summary cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Min card */}
                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Température minimale</p>
                            <span className="text-4xl font-bold text-blue-500">{summary.globalMin}°C</span>
                            <p className="text-xs text-gray-400">Sur les 7 derniers jours</p>
                        </div>

                        {/* Avg card */}
                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Température moyenne</p>
                            <span className="text-4xl font-bold text-orange-500">{summary.globalAvg}°C</span>
                            <p className="text-xs text-gray-400">Sur les 7 derniers jours</p>
                        </div>

                        {/* Max card */}
                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Température maximale</p>
                            <span className="text-4xl font-bold text-red-500">{summary.globalMax}°C</span>
                            <p className="text-xs text-gray-400">Sur les 7 derniers jours</p>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-medium leading-none">Min / Moyenne / Max par jour</h2>
                        <p className="font-light text-gray-400 text-base leading-none">
                            7 derniers jours de données de température
                        </p>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm">Chargement des statistiques...</p>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                            <p className="text-red-500 text-sm">{error}</p>
                            <button
                                onClick={fetchStats}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!loading && !error && chartData && (
                        <div className="h-[350px]">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    )}
                </div>

                {/* Daily breakdown table */}
                {!loading && !error && weeklyData && (
                    <div className="flex flex-col gap-4 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium leading-none">Détail par jour</h2>
                            <p className="font-light text-gray-400 text-base leading-none">
                                Récapitulatif journalier
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 font-medium text-gray-500">Date</th>
                                        <th className="py-3 px-4 font-medium text-blue-500">Min</th>
                                        <th className="py-3 px-4 font-medium text-orange-500">Moyenne</th>
                                        <th className="py-3 px-4 font-medium text-red-500">Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeklyData.dates.map((date, i) => (
                                        <tr key={date} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-700">{date}</td>
                                            <td className="py-3 px-4 text-blue-500">
                                                {weeklyData.minTemps[i] !== null ? weeklyData.minTemps[i].toFixed(1) + '°C' : '--'}
                                            </td>
                                            <td className="py-3 px-4 text-orange-500">
                                                {weeklyData.avgTemps[i] !== null ? weeklyData.avgTemps[i].toFixed(1) + '°C' : '--'}
                                            </td>
                                            <td className="py-3 px-4 text-red-500">
                                                {weeklyData.maxTemps[i] !== null ? weeklyData.maxTemps[i].toFixed(1) + '°C' : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Stats;
