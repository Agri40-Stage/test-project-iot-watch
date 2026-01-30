const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&current_weather=true&timezone=auto`
    );

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();
      
      return data; // Return the full data structure directly from backend
    }
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
  }
};

export default fetchLatestTemperature;