const fetchLatestTemperature = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}?latitude=30.4202&longitude=-9.5982&current_weather=true&timezone=auto`
    );

    if (!response.ok) {
      console.error("Error fetching latest temperature:", response.statusText);
    } else if (response.status === 200) {
      const data = await response.json();

      // Extract the relevant data from the response
      const time = data.current_weather.time;
      const temperature = data.current_weather.temperature;

      // Store the latest temperature in local storage for trend calculation
      // So in the next fetch, we can compare the latest temperature with the previous one
      // and determine if the temperature is rising, falling, or stable
      const latestTemperature = localStorage.getItem("latestTemperature") || 0;

      let trend = "";
      if (temperature > latestTemperature) {
        trend = "up";
      } else if (temperature < latestTemperature) {
        trend = "down";
      } else {
        trend = "stable";
      }

      // After calculating the trend, we update the latest temperature in local storage
      // to be used in the next fetch
      localStorage.setItem("latestTemperature", temperature);

      return { time, temperature, trend };
    }
  } catch (error) {
    console.error("Error fetching latest temperature:", error);
  }
};

export default fetchLatestTemperature;