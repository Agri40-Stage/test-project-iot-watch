import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Cloud, 
  MapPin,
  RefreshCw,
  Loader2
} from 'lucide-react';

/**
 * Weather Dashboard Component
 * 
 * Displays comprehensive real-time weather data fetched from Open-Meteo API
 * including temperature, humidity, wind speed, wind direction, precipitation
 * probability, and weather conditions.
 */
const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch comprehensive weather data from the backend API
   */
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setWeatherData(data);
      setLastUpdated(new Date());
      console.log('Weather data fetched successfully:', data);
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-refresh weather data every 5 minutes
   */
  useEffect(() => {
    fetchWeatherData();
    
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Get weather icon based on weather code
   */
  const getWeatherIcon = (weatherCode) => {
    if (weatherCode >= 0 && weatherCode <= 3) return <Eye className="w-6 h-6" />; // Clear to overcast
    if (weatherCode === 45 || weatherCode === 48) return <Cloud className="w-6 h-6" />; // Fog
    if (weatherCode >= 51 && weatherCode <= 55) return <Droplets className="w-6 h-6" />; // Drizzle
    if (weatherCode >= 61 && weatherCode <= 65) return <Droplets className="w-6 h-6" />; // Rain
    if (weatherCode >= 71 && weatherCode <= 77) return <Cloud className="w-6 h-6" />; // Snow
    if (weatherCode >= 80 && weatherCode <= 86) return <Droplets className="w-6 h-6" />; // Showers
    if (weatherCode >= 95 && weatherCode <= 99) return <Cloud className="w-6 h-6" />; // Thunderstorm
    return <Eye className="w-6 h-6" />; // Default
  };

  /**
   * Get wind direction text
   */
  const getWindDirection = (degrees) => {
    if (!degrees) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !weatherData) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-lg font-semibold mb-4">
          Error loading weather data: {error}
        </div>
        <button 
          onClick={fetchWeatherData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-lg font-semibold">No weather data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with location and refresh info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">
            {weatherData.location?.city || 'Weather Dashboard'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
          </span>
          <button 
            onClick={fetchWeatherData}
            disabled={loading}
            className={`p-2 rounded-full transition-colors ${
              loading 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Weather Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Temperature Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Temperature</h3>
          </div>
          <div className="text-3xl font-bold text-red-500">
            {weatherData.temperature?.toFixed(1)}°C
          </div>
          <p className="text-gray-600 text-sm">Current temperature</p>
        </div>

        {/* Humidity Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Humidity</h3>
          </div>
          <div className="text-3xl font-bold text-blue-500">
            {weatherData.humidity || 'N/A'}%
          </div>
          <p className="text-gray-600 text-sm">Relative humidity</p>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-6 h-6 text-cyan-500" />
            <h3 className="text-lg font-semibold">Wind Speed</h3>
          </div>
          <div className="text-3xl font-bold text-cyan-500">
            {weatherData.wind_speed || 'N/A'} km/h
          </div>
          <p className="text-gray-600 text-sm">Wind speed at 10m</p>
        </div>

        {/* Wind Direction Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-6 h-6 text-cyan-500" />
            <h3 className="text-lg font-semibold">Wind Direction</h3>
          </div>
          <div className="text-3xl font-bold text-cyan-500">
            {getWindDirection(weatherData.wind_direction)}
          </div>
          <p className="text-gray-600 text-sm">
            {weatherData.wind_direction ? `${weatherData.wind_direction}°` : 'N/A'}
          </p>
        </div>

        {/* Precipitation Probability Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold">Rain Chance</h3>
          </div>
          <div className="text-3xl font-bold text-purple-500">
            {weatherData.precipitation_probability || 'N/A'}%
          </div>
          <p className="text-gray-600 text-sm">Precipitation probability</p>
        </div>

        {/* Weather Conditions Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            {getWeatherIcon(weatherData.weather_code)}
            <h3 className="text-lg font-semibold">Conditions</h3>
          </div>
          <div className="text-xl font-semibold">
            {weatherData.weather_description}
          </div>
          <p className="text-gray-600 text-sm">
            Code: {weatherData.weather_code}
          </p>
        </div>

        {/* Location Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-6 h-6 text-gray-500" />
            <h3 className="text-lg font-semibold">Location</h3>
          </div>
          <div className="text-lg">
            {weatherData.location?.city}
          </div>
          <p className="text-gray-600 text-sm">
            {weatherData.location?.latitude?.toFixed(4)}, {weatherData.location?.longitude?.toFixed(4)}
          </p>
        </div>

        {/* Timestamp Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Data Timestamp</h3>
          <div className="text-lg">
            {formatTimestamp(weatherData.timestamp)}
          </div>
          <p className="text-gray-600 text-sm">API response time</p>
        </div>
      </div>

      {/* Loading indicator for refresh */}
      {loading && weatherData && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard; 