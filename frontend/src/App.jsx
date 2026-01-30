import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  Wind, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Activity,
  RefreshCw,
  Leaf,
  Menu,
  X
} from 'lucide-react';

function App() {
  // Console banner
  console.log('%c🌱 AGRI 4.0 - Smart Agriculture Watch System', 'color: #10b981; font-size: 20px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════════', 'color: #10b981;');
  console.log('%cVersion: 2.0.0', 'color: #34d399;');
  console.log('%cBackend API: http://localhost:5000/api/sensor', 'color: #2dd4bf;');
  console.log('%cMode: Development', 'color: #f59e0b;');
  console.log('%c═══════════════════════════════════════════', 'color: #10b981;');
  
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fetchSensorData = async () => {
    try {
      console.log('🔄 [API] Starting data fetch...');
      setLoading(!sensorData); // Only show loading on first load
      setError(null);
      
      console.log('📡 [API] Fetching from: http://localhost:5000/api/sensor');
      const response = await fetch('http://localhost:5000/api/sensor');
      
      console.log(`📊 [API] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [API] Data received successfully:', data);
      console.log('🌡️ [API] Temperature:', data.temperature, '°C');
      console.log('💨 [API] Wind Speed:', data.windspeed, 'km/h');
      console.log('📍 [API] Location:', data.location);
      console.log('⚠️ [API] Status:', data.status);
      
      setSensorData(data);
    } catch (err) {
      console.error("❌ [API] Fetch error:", err);
      console.error("🔴 [API] Error message:", err.message);
      setError(err.message);
    } finally {
      console.log('🏁 [API] Fetch completed');
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    console.log('🚀 [APP] Component mounted - Starting initial data fetch');
    fetchSensorData();
    
    // Auto-refresh every 30 seconds
    console.log('⏰ [APP] Setting up auto-refresh interval (30s)');
    const interval = setInterval(() => {
      console.log('🔄 [APP] Auto-refresh triggered');
      fetchSensorData();
    }, 30000);
    
    return () => {
      console.log('🛑 [APP] Component unmounted - Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [USER] Manual refresh button clicked');
    setRefreshing(true);
    fetchSensorData();
  };

  // Get temperature glow color
  const getTempGlow = (temp) => {
    if (temp > 30) return 'glow-red';
    if (temp < 10) return 'glow-blue';
    return 'glow-emerald';
  };

  // Status configuration
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      dotColor: 'bg-emerald-500',
      label: 'SUCCESS'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      dotColor: 'bg-amber-500',
      label: 'WARNING'
    },
    danger: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      dotColor: 'bg-red-500',
      label: 'DANGER'
    }
  };
  // Loading State
  if (loading && !sensorData) {
    console.log('⏳ [UI] Showing loading state');
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
          />
          <p className="text-slate-400 font-medium">Connecting to sensors...</p>
        </motion.div>
      </div>
    );
  }
  // Error State
  if (error && !sensorData) {
    console.log('❌ [UI] Showing error state:', error);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-red-950/40 to-slate-900/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
                <p className="text-slate-300 mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium rounded-lg transition-all"
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  const status = statusConfig[sensorData?.status] || statusConfig.success;
  const StatusIcon = status.icon;

  console.log('✅ [UI] Rendering dashboard with data');
  console.log('🎨 [UI] Status configuration:', status.label);
  console.log('🌡️ [UI] Temperature glow:', getTempGlow(sensorData?.temperature || 0));

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/50">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">AGRI 4.0</h1>
                <p className="text-xs text-slate-400">Smart Watch System</p>
              </div>
            </motion.div>

            {/* Desktop Actions */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden md:flex items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-emerald-500/20 z-50 p-6"
            >
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-900/40 backdrop-blur-xl p-8 shadow-2xl"
        >
          {/* Background Orb */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Current Location</p>
                <p className="text-2xl font-bold text-slate-100">{sensorData?.location || 'Agadir, Morocco'}</p>
              </div>
            </div>

            {/* Live Status */}
            <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-5 py-3 rounded-xl">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`w-3 h-3 ${status.dotColor} rounded-full shadow-lg`}
                style={{ boxShadow: `0 0 10px currentColor` }}
              />
              <span className="font-semibold text-slate-200">Live System Status</span>
            </div>
          </div>
        </motion.div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Temperature Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl transition-all duration-300 ${getTempGlow(sensorData?.temperature || 0)}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 font-medium mb-1">Temperature</p>
                <p className="text-xs text-slate-500">Real-time reading</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl">
                <Thermometer className="w-6 h-6 text-orange-400" />
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3, stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {sensorData?.temperature || 0}
                </span>
                <span className="text-2xl text-slate-400">°C</span>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((sensorData?.temperature || 0) / 50 * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Wind Speed Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 font-medium mb-1">Wind Speed</p>
                <p className="text-xs text-slate-500">Current conditions</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl">
                <Wind className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4, stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {sensorData?.windspeed || 0}
                </span>
                <span className="text-2xl text-slate-400">km/h</span>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((sensorData?.windspeed || 0) / 100 * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* AI Advice Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${status.bg} backdrop-blur-xl border-2 ${status.border} rounded-2xl p-8 shadow-2xl`}
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className={`flex-shrink-0 w-14 h-14 ${status.bg} border ${status.border} rounded-xl flex items-center justify-center`}
            >
              <StatusIcon className={`w-7 h-7 ${status.color}`} />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-100">AI Agricultural Advisor</h3>
                <span className={`px-3 py-1 ${status.bg} ${status.color} text-xs font-bold uppercase rounded-full`}>
                  {status.label}
                </span>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-300 leading-relaxed"
              >
                {sensorData?.advice || 'Loading recommendations...'}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-slate-500 text-sm"
        >
          <p>Real-time data updates every 30 seconds</p>
          <p className="mt-1">Powered by Open-Meteo Weather API</p>
        </motion.footer>
      </main>
    </div>
  );
}

export default App;
