import React, { useState, useEffect } from "react"
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
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { API_BASE_URL } from '../config';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const WeeklyStatsEnhanced = () => {
    const [weeklyData, setWeeklyData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [chartType, setChartType] = useState("line")
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        fetchWeeklyStats()
        // Refresh data every 5 minutes
        const interval = setInterval(fetchWeeklyStats, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchWeeklyStats = async () => {
        try {
            setLoading(true)
            const response = await fetch(API_BASE_URL +"/api/weekly-stats")
            console.log(response)            
            const data = await response.json()

            if (data.success) {
                setWeeklyData(data)
                setError(null)
            } else {
                setError(data.error || "Erreur lors du chargement des données")
            }
        } catch (err) {
            setError("Erreur de connexion au serveur")
            console.error("Error fetching weekly stats:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
        })
    }

    const getTrendIcon = (trend) => {
        switch (trend?.trend_24h) {
            case "increasing":
                return <span className="text-red-500">↗ En hausse</span>
            case "decreasing":
                return <span className="text-blue-500">↘ En baisse</span>
            case "stable":
                return <span className="text-green-500">→ Stable</span>
            default:
                return <span className="text-gray-500">— Inconnu</span>
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white flex justify-center  items-center
 h-[100%] rounded-lg shadow-md p-6">
                <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur</h3>
                    <p className="text-gray-600">{error}</p>
                    <button onClick={fetchWeeklyStats} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Réessayer
                    </button>
                </div>
            </div>
        )
    }

    if (!weeklyData || weeklyData.dates.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Statistiques Hebdomadaires</h3>
                <p className="text-gray-500">Aucune donnée disponible pour les 7 derniers jours</p>
            </div>
        )
    }

    const chartData = {
        labels: weeklyData.dates.map(formatDate),
        datasets: [
            {
                label: "Température Min (°C)",
                data: weeklyData.minTemps,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
            },
            {
                label: "Température Max (°C)",
                data: weeklyData.maxTemps,
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                tension: 0.4,
            },
            {
                label: "Température Moyenne (°C)",
                data: weeklyData.avgTemps,
                borderColor: "rgb(34, 197, 94)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                tension: 0.4,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Températures des 7 derniers jours",
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}°C`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: "Température (°C)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    }

    const ChartComponent = chartType === "line" ? Line : Bar

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Statistiques Hebdomadaires</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        {chartType === "line" ? "📊 Barres" : "📈 Ligne"}
                    </button>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
                    >
                        {showDetails ? "Masquer" : "Détails"}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <ChartComponent data={chartData} options={chartOptions} />
            </div>

            {showDetails && (
                <div className="mt-4 space-y-4">
                    {/* Tendance */}
                    {weeklyData.trends && (
                        <div className="bg-gray-50 p-3 rounded">
                            <h4 className="font-medium text-gray-700 mb-2">Tendance 24h</h4>
                            <div className="flex items-center gap-4">
                                {getTrendIcon(weeklyData.trends)}
                                {weeklyData.trends.temperature_change !== undefined && (
                                    <span className="text-sm text-gray-600">
                                        Variation: {weeklyData.trends.temperature_change > 0 ? "+" : ""}
                                        {weeklyData.trends.temperature_change}°C
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Statistiques globales */}
                    {weeklyData.overallStats && (
                        <div className="bg-gray-50 p-3 rounded">
                            <h4 className="font-medium text-gray-700 mb-2">Résumé de la semaine</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Min:</span>
                                    <span className="ml-1 font-medium text-blue-600">{weeklyData.overallStats.overall_min.toFixed(2)}°C</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Max:</span>
                                    <span className="ml-1 font-medium text-red-600">{weeklyData.overallStats.overall_max.toFixed(2)}°C</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Moyenne:</span>
                                    <span className="ml-1 font-medium text-green-600">
                                        {weeklyData.overallStats.overall_avg.toFixed(1)}°C
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Mesures:</span>
                                    <span className="ml-1 font-medium">{weeklyData.overallStats.total_readings}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dernière mise à jour */}
                    {weeklyData.last_updated && (
                        <div className="text-xs text-gray-500 text-center">
                            Dernière mise à jour: {new Date(weeklyData.last_updated).toLocaleString("fr-FR")}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WeeklyStatsEnhanced
