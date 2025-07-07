const analyzeCropWeather = async (cropName, humidity = null, weather = null) => {
  try {
    const params = new URLSearchParams({
      crop: cropName
    });
    
    if (humidity) {
      params.append('humidity', humidity);
    }
    
    if (weather) {
      params.append('weather', weather);
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/crop/analyze?${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing crop weather:", error);
    throw error;
  }
};

const getCropSuggestions = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/crop/suggestions`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.crops;
  } catch (error) {
    console.error("Error fetching crop suggestions:", error);
    throw error;
  }
};

export { analyzeCropWeather, getCropSuggestions }; 