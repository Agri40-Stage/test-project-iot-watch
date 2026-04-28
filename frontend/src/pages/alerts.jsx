import React, { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, ThermometerIcon } from 'lucide-react';
import Header from '../components/Header';
import { API_BASE_URL } from '../config';

// Default thresholds — user can adjust them
const DEFAULT_MIN_THRESHOLD = 10;
const DEFAULT_MAX_THRESHOLD = 35;

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [minThreshold, setMinThreshold] = useState(DEFAULT_MIN_THRESHOLD);
    const [maxThreshold, setMaxThreshold] = useState(DEFAULT_MAX_THRESHOLD);
    const [lastChecked, setLastChecked] = useState(null);

    const detectAlerts = (temperatures, timestamps) => {
        const detected = [];

        temperatures.forEach((temp, i) => {
            if (temp > maxThreshold) {
                detected.push({
                    id: `high-${i}`,
                    type: 'high',
                    temperature: temp,
                    timestamp: timestamps[i],
                    message: `Température trop élevée : ${temp.toFixed(1)}°C (seuil : ${maxThreshold}°C)`,
                });
            } else if (temp < minThreshold) {
                detected.push({
                    id: `low-${i}`,
                    type: 'low',
                    temperature: temp,
                    timestamp: timestamps[i],
                    message: `Température trop basse : ${temp.toFixed(1)}°C (seuil : ${minThreshold}°C)`,
                });
            }
        });

        return detected;
    };

    const fetchAndAnalyze = async () => {
        try {
            setLoading(true);

            // Fetch temperature history from Open-Meteo (same source as the app)
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&forecast_days=1&timezone=auto&hourly=temperature_2m`
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            const timestamps = data.hourly.time;
            const temperatures = data.hourly.temperature_2m;

            // Keep only past readings (up to now)
            const now = new Date();
            const pastIndexes = timestamps
                .map((t, i) => ({ t: new Date(t), i }))
                .filter(({ t }) => t <= now);

            const pastTimestamps = pastIndexes.map(({ i }) => timestamps[i]);
            const pastTemperatures = pastIndexes.map(({ i }) => temperatures[i]);

            setHistory(
                pastIndexes.map(({ i }) => ({
                    timestamp: timestamps[i],
                    temperature: temperatures[i],
                }))
            );

            const detected = detectAlerts(pastTemperatures, pastTimestamps);
            setAlerts(detected);
            setLastChecked(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            setError(`Impossible de charger les données : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Re-run whenever thresholds change
    useEffect(() => {
        fetchAndAnalyze();
        const interval = setInterval(fetchAndAnalyze, 30000);
        return () => clearInterval(interval);
    }, [minThreshold, maxThreshold]);

    const alertIcon = (type) => {
        if (type === 'high')
            return <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />;
        return <AlertTriangleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    };

    const alertBg = (type) =>
        type === 'high'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200';

    const alertText = (type) =>
        type === 'high' ? 'text-red-700' : 'text-blue-700';

    return (
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
            <Header />

            <div className="flex flex-col gap-8 py-12 px-6">
                {/* Page title */}
                <div className="w-full flex flex-col gap-2 text-left">
                    <h1 className="font-bold text-3xl">Alertes de Température</h1>
                    <p className="text-sm font-light text-gray-400">
                        Détection automatique des températures anormales
                    </p>
                </div>

                {/* Threshold configuration */}
                <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-medium leading-none">Configuration des seuils</h2>
                        <p className="font-light text-gray-400 text-base leading-none">
                            Définissez les seuils minimum et maximum acceptables
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-blue-500">
                                Seuil minimum (°C)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="-20"
                                    max="30"
                                    value={minThreshold}
                                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                                    className="flex-1 accent-blue-500"
                                />
                                <span className="text-lg font-bold text-blue-500 w-16 text-right">
                                    {minThreshold}°C
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-red-500">
                                Seuil maximum (°C)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="20"
                                    max="60"
                                    value={maxThreshold}
                                    onChange={(e) => setMaxThreshold(Number(e.target.value))}
                                    className="flex-1 accent-red-500"
                                />
                                <span className="text-lg font-bold text-red-500 w-16 text-right">
                                    {maxThreshold}°C
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary badges */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Total alertes</p>
                            <span className="text-4xl font-bold text-orange-500">{alerts.length}</span>
                            <p className="text-xs text-gray-400">Aujourd'hui</p>
                        </div>

                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Alertes haute temp.</p>
                            <span className="text-4xl font-bold text-red-500">
                                {alerts.filter((a) => a.type === 'high').length}
                            </span>
                            <p className="text-xs text-gray-400">Supérieure à {maxThreshold}°C</p>
                        </div>

                        <div className="flex flex-col gap-2 py-6 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                            <p className="text-sm font-light text-gray-400">Alertes basse temp.</p>
                            <span className="text-4xl font-bold text-blue-500">
                                {alerts.filter((a) => a.type === 'low').length}
                            </span>
                            <p className="text-xs text-gray-400">Inférieure à {minThreshold}°C</p>
                        </div>
                    </div>
                )}

                {/* Alerts list */}
                <div className="flex flex-col gap-6 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium leading-none">Liste des alertes</h2>
                            <p className="font-light text-gray-400 text-base leading-none">
                                {lastChecked ? `Dernière vérification : ${lastChecked}` : 'Chargement...'}
                            </p>
                        </div>
                        <button
                            onClick={fetchAndAnalyze}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                            <BellIcon className="h-4 w-4" />
                            Actualiser
                        </button>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center h-40">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm">Analyse en cours...</p>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <p className="text-red-500 text-sm">{error}</p>
                            <button
                                onClick={fetchAndAnalyze}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!loading && !error && alerts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <CheckCircleIcon className="h-12 w-12 text-green-500" />
                            <p className="text-gray-500 font-medium">Aucune alerte détectée</p>
                            <p className="text-gray-400 text-sm">
                                Toutes les températures sont dans les seuils définis
                            </p>
                        </div>
                    )}

                    {!loading && !error && alerts.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`flex items-start gap-3 p-4 rounded-lg border ${alertBg(alert.type)}`}
                                >
                                    {alertIcon(alert.type)}
                                    <div className="flex flex-col gap-1 flex-1">
                                        <p className={`font-medium text-sm ${alertText(alert.type)}`}>
                                            {alert.message}
                                        </p>
                                        <p className="text-xs text-gray-500">{alert.timestamp}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ThermometerIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-600">
                                            {alert.temperature.toFixed(1)}°C
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent readings table */}
                {!loading && !error && history.length > 0 && (
                    <div className="flex flex-col gap-4 py-8 px-6 rounded-xl border-[0.5px] border-gray-300 bg-white">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-medium leading-none">Relevés d'aujourd'hui</h2>
                            <p className="font-light text-gray-400 text-base leading-none">
                                Toutes les mesures horaires avec statut
                            </p>
                        </div>
                        <div className="overflow-x-auto max-h-64 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 font-medium text-gray-500">Heure</th>
                                        <th className="py-3 px-4 font-medium text-gray-500">Température</th>
                                        <th className="py-3 px-4 font-medium text-gray-500">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record, i) => {
                                        const isHigh = record.temperature > maxThreshold;
                                        const isLow = record.temperature < minThreshold;
                                        return (
                                            <tr
                                                key={i}
                                                className={`border-b border-gray-100 transition-colors ${isHigh
                                                    ? 'bg-red-50'
                                                    : isLow
                                                        ? 'bg-blue-50'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="py-3 px-4 text-gray-700">{record.timestamp}</td>
                                                <td
                                                    className={`py-3 px-4 font-medium ${isHigh
                                                        ? 'text-red-600'
                                                        : isLow
                                                            ? 'text-blue-600'
                                                            : 'text-gray-700'
                                                        }`}
                                                >
                                                    {record.temperature.toFixed(1)}°C
                                                </td>
                                                <td className="py-3 px-4">
                                                    {isHigh ? (
                                                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                                                            <XCircleIcon className="h-3 w-3" /> Trop élevée
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                                                            <AlertTriangleIcon className="h-3 w-3" /> Trop basse
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                                                            <CheckCircleIcon className="h-3 w-3" /> Normal
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Alerts;
