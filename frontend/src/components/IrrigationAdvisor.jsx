import React, { useState, useEffect } from 'react';
import { getIrrigationAdvice, getCurrentWeather } from '../api/irrigation';

const IrrigationAdvisor = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [irrigationAdvice, setIrrigationAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading irrigation data...');
      
      // Try to load weather data
      try {
        const weather = await getCurrentWeather();
        console.log('Weather data loaded:', weather);
        console.log('Precipitation value:', weather.precipitation, 'Type:', typeof weather.precipitation);
        setWeatherData(weather);
      } catch (weatherError) {
        console.error('Weather data error:', weatherError);
        setError('Failed to load weather data: ' + weatherError.message);
      }
      
      // Try to load irrigation advice
      try {
        const irrigation = await getIrrigationAdvice();
        console.log('Irrigation advice loaded:', irrigation);
        setIrrigationAdvice(irrigation);
      } catch (irrigationError) {
        console.error('Irrigation advice error:', irrigationError);
        setError('Failed to load irrigation advice: ' + irrigationError.message);
      }
      
    } catch (error) {
      console.error('General error:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-lg text-gray-700 dark:text-gray-300">Loading irrigation data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Irrigation Advisor</h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-powered irrigation recommendations based on real-time weather conditions
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Current Weather Conditions */}
      {weatherData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Weather Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">🌡️</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {weatherData.temperature !== null && weatherData.temperature !== undefined ? `${weatherData.temperature}°C` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">💧</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {weatherData.humidity !== null && weatherData.humidity !== undefined ? `${weatherData.humidity}%` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">☁️</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {weatherData.precipitation !== null && weatherData.precipitation !== undefined ? `${weatherData.precipitation}mm` : '0.0mm'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">💨</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {weatherData.wind_speed !== null && weatherData.wind_speed !== undefined ? `${weatherData.wind_speed} km/h` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Irrigation Recommendation */}
      {irrigationAdvice && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Irrigation Recommendation</h2>
          
          {/* Overall Recommendation */}
          {irrigationAdvice.irrigation_advice?.overall_recommendation && (
            <div className="mb-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                irrigationAdvice.irrigation_advice.overall_recommendation === 'ADJUST IMMEDIATELY' 
                  ? 'bg-red-100 text-red-800' 
                  : irrigationAdvice.irrigation_advice.overall_recommendation === 'MODERATE ADJUSTMENTS'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                <span className="mr-2">
                  {irrigationAdvice.irrigation_advice.overall_recommendation === 'ADJUST IMMEDIATELY' ? '🚨' :
                   irrigationAdvice.irrigation_advice.overall_recommendation === 'MODERATE ADJUSTMENTS' ? '⚠️' : '✅'}
                </span>
                {irrigationAdvice.irrigation_advice.overall_recommendation}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {irrigationAdvice.irrigation_advice?.summary && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">AI Analysis Summary</h3>
              <p className="text-blue-800 dark:text-blue-200">
                {irrigationAdvice.irrigation_advice.summary}
              </p>
            </div>
          )}

          {/* Detailed AI Recommendations */}
          {irrigationAdvice.irrigation_advice?.detailed_advice && irrigationAdvice.irrigation_advice.detailed_advice.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI-Powered Recommendations</h3>
              <div className="space-y-3">
                {irrigationAdvice.irrigation_advice.detailed_advice.map((advice, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{advice.factor}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        advice.priority === 'High' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        advice.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      }`}>
                        {advice.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Impact:</span> {advice.impact}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">Recommendation:</span> {advice.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full AI Analysis */}
          {irrigationAdvice.irrigation_advice?.ai_analysis && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Complete AI Analysis</h3>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {irrigationAdvice.irrigation_advice.ai_analysis}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback content if no data */}
      {!weatherData && !irrigationAdvice && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">No weather data available. Please ensure the backend is running.</p>
          <button 
            onClick={loadData}
            className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-2 rounded transition-colors"
          >
            Load Data
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={async () => {
            try {
              setLoading(true);
              const response = await fetch('http://localhost:5000/api/weather/refresh', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              const result = await response.json();
              if (result.success) {
                await loadData(); // Reload data after refresh
              } else {
                setError('Failed to refresh weather data: ' + result.error);
              }
            } catch (error) {
              setError('Failed to refresh weather data: ' + error.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
        >
          Fetch Fresh Weather
        </button>
      </div>
    </div>
  );
};

export default IrrigationAdvisor; 