const getHumidityHistory = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/humidity/history`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching humidity history:", error);
    throw error;
  }
};

export { getHumidityHistory }; 