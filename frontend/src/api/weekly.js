// Dans frontend/src/api/weekly.js
const fetchWeeklyStats = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/weekly-stats`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || response.statusText;
            console.error("Error fetching weekly stats:", errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Network error fetching weekly stats:", error);
        throw new Error("Failed to fetch weekly statistics");
    }
};

const fetchWeeklyChartData = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/weekly-chart-data`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || response.statusText;
            console.error("Error fetching weekly chart data:", errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Network error fetching weekly chart data:", error);
        throw new Error("Failed to fetch weekly chart data");
    }
};

// Et modifier l'export pour inclure la nouvelle fonction
export { fetchWeeklyStats, fetchWeeklyChartData };