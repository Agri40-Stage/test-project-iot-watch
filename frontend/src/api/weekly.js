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

const fetchWeeklyCharts = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/weekly-charts`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || response.statusText;
            console.error("Error fetching weekly charts:", errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Network error fetching weekly charts:", error);
        throw new Error("Failed to fetch weekly charts");
    }
};

export { fetchWeeklyStats, fetchWeeklyCharts };