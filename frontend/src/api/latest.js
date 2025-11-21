const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/latest`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
    // Return a nullish state so the UI can handle it gracefully
    return { time: "N/A", temperature: "N/A", trend: "stable" };
  }
};

export default fetchLatestTemperature;