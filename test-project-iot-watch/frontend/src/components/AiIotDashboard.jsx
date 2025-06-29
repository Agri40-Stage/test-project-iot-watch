import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Battery, 
  Wifi, 
  WifiOff,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';

/**
 * AI & IoT Dashboard Component
 * 
 * Comprehensive dashboard displaying:
 * - AI-powered weather insights and predictions
 * - IoT device status and health monitoring
 * - Anomaly detection results
 * - Weather pattern classification
 * - Device health metrics and alerts
 */
const AiIotDashboard = () => {
  const [aiInsights, setAiInsights] = useState(null);
  const [iotDevices, setIotDevices] = useState(null);
  const [iotHealth, setIotHealth] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch AI insights from the backend
   */
  const fetchAiInsights = async () => {
    try {
      const response = await fetch('/api/ai/insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
        console.log('AI Insights:', data);
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    }
  };

  /**
   * Fetch IoT devices status
   */
  const fetchIotDevices = async () => {
    try {
      const response = await fetch('/api/iot/devices');
      if (response.ok) {
        const data = await response.json();
        setIotDevices(data);
        console.log('IoT Devices:', data);
      }
    } catch (err) {
      console.error('Error fetching IoT devices:', err);
    }
  };

  /**
   * Fetch IoT health summary
   */
  const fetchIotHealth = async () => {
    try {
      const response = await fetch('/api/iot/health');
      if (response.ok) {
        const data = await response.json();
        setIotHealth(data);
        console.log('IoT Health:', data);
      }
    } catch (err) {
      console.error('Error fetching IoT health:', err);
    }
  };

  /**
   * Fetch anomaly detection results
   */
  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/api/ai/anomalies?hours=24');
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data);
        console.log('Anomalies:', data);
      }
    } catch (err) {
      console.error('Error fetching anomalies:', err);
    }
  };

  /**
   * Load all data on component mount
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchAiInsights(),
          fetchIotDevices(),
          fetchIotHealth(),
          fetchAnomalies()
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Get health score color
   */
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get health score background
   */
  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  /**
   * Get alert severity color
   */
  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading AI & IoT data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold">AI & IoT Dashboard</h2>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Predictions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">AI Predictions</h3>
            </div>
            
            {aiInsights.ai_analysis?.temperature_prediction && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">24h Prediction:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {aiInsights.ai_analysis.temperature_prediction.predicted_temperature.toFixed(1)}°C
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="text-sm">
                    {(aiInsights.ai_analysis.temperature_prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Model: {aiInsights.ai_analysis.temperature_prediction.model_type}
                </div>
              </div>
            )}
          </div>

          {/* Pattern Classification */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Weather Pattern</h3>
            </div>
            
            {aiInsights.ai_analysis?.pattern_classification && (
              <div className="space-y-3">
                <div className="text-2xl font-bold text-green-600">
                  {aiInsights.ai_analysis.pattern_classification.pattern_type}
                </div>
                <div className="text-sm text-gray-600">
                  Cluster ID: {aiInsights.ai_analysis.pattern_classification.cluster_id}
                </div>
                <div className="text-xs text-gray-500">
                  Confidence: {(aiInsights.ai_analysis.pattern_classification.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IoT Health Overview */}
      {iotHealth && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">IoT Device Health</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Overall Health */}
            <div className={`p-4 rounded-lg ${getHealthBg(iotHealth.overall_health_score)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Overall Health</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(iotHealth.overall_health_score)}`}>
                {iotHealth.overall_health_score}%
              </div>
            </div>

            {/* Battery Score */}
            <div className={`p-4 rounded-lg ${getHealthBg(iotHealth.battery_score)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4" />
                <span className="text-sm font-medium">Battery</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(iotHealth.battery_score)}`}>
                {iotHealth.battery_score}%
              </div>
            </div>

            {/* Connectivity */}
            <div className={`p-4 rounded-lg ${getHealthBg(iotHealth.connectivity_score)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Connectivity</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(iotHealth.connectivity_score)}`}>
                {iotHealth.connectivity_score}%
              </div>
            </div>

            {/* Sensors Status */}
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Sensors</span>
              </div>
              <div className="text-2xl font-bold text-gray-700">
                {iotHealth.online_sensors}/{iotHealth.total_sensors}
              </div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
          </div>
        </div>
      )}

      {/* IoT Devices Grid */}
      {iotDevices && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">IoT Sensors</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(iotDevices.sensors).map(([sensorId, sensor]) => (
              <div key={sensorId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{sensor.name}</span>
                  {sensor.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      sensor.status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sensor.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <span className={`font-medium ${
                      sensor.battery_level > 20 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sensor.battery_level}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {sensor.sensor_type}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latency:</span>
                    <span className="text-xs">{sensor.network_latency}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Anomaly Detection</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {anomalies.anomaly_detection?.anomalies_detected || 0}
              </div>
              <div className="text-sm text-orange-700">Anomalies Detected</div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {anomalies.total_readings || 0}
              </div>
              <div className="text-sm text-blue-700">Total Readings</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {anomalies.analysis_period_hours || 24}h
              </div>
              <div className="text-sm text-gray-700">Analysis Period</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiInsights?.ai_analysis?.recommendations && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
          
          <div className="space-y-2">
            {aiInsights.ai_analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-yellow-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IoT Alerts */}
      {iotHealth?.alerts && iotHealth.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold">Device Alerts</h3>
          </div>
          
          <div className="space-y-2">
            {iotHealth.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{alert.message}</div>
                    <div className="text-xs opacity-75">
                      Sensor: {alert.sensor_id} | Severity: {alert.severity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiIotDashboard; 