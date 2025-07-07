import React, { useState, useEffect } from 'react';
import { analyzeCropWeather, getCropSuggestions } from '../api/crop';
import { Search, Leaf, Thermometer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const CropAdvisor = () => {
  const [cropName, setCropName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load crop suggestions on component mount
    loadCropSuggestions();
  }, []);

  const loadCropSuggestions = async () => {
    try {
      const crops = await getCropSuggestions();
      setSuggestions(crops);
    } catch (error) {
      console.error('Failed to load crop suggestions:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!cropName.trim()) {
      setError('Please enter a crop name');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCropWeather(cropName);
      setAnalysis(result);
    } catch (error) {
      setError('Failed to analyze crop. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelect = (crop) => {
    setCropName(crop);
    setShowSuggestions(false);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Clock className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Leaf className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Crop Weather Advisor</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Get AI-powered insights on how weather affects your crops
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label htmlFor="crop-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Crop Name
            </label>
            <div className="relative crop-suggestions-container">
              <input
                id="crop-input"
                type="text"
                value={cropName}
                onChange={(e) => {
                  setCropName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g., Strawberries, Tomatoes, Corn..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
              {/* Crop Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {suggestions
                    .filter(crop => crop.toLowerCase().includes(cropName.toLowerCase()))
                    .slice(0, 10)
                    .map((crop, index) => (
                      <button
                        key={index}
                        onClick={() => handleCropSelect(crop)}
                        className="w-full px-4 py-3 text-left bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                      >
                        {crop}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !cropName.trim()}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3 px-6 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Crop Weather Impact'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analysis for {analysis.crop}
            </h2>
            {analysis.risk_level && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getRiskColor(analysis.risk_level)} dark:bg-opacity-20`}>
                {getRiskIcon(analysis.risk_level)}
                <span className="font-medium text-gray-900 dark:text-white">Risk: {analysis.risk_level}</span>
              </div>
            )}
          </div>

          {/* Current Conditions */}
          {analysis.current_conditions && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Weather Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Temperature: {analysis.current_conditions.temperature}°C
                  </span>
                </div>
                {analysis.current_conditions.humidity && (
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Humidity: {analysis.current_conditions.humidity}%
                    </span>
                  </div>
                )}
                {analysis.current_conditions.weather_condition && (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full bg-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Weather: {analysis.current_conditions.weather_condition}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Advice */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Analysis & Recommendations</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis.ai_advice}
              </div>
            </div>
          </div>

          {/* Key Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Recommendations</h3>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropAdvisor; 