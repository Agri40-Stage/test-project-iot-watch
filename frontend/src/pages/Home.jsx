import React from 'react';
import { Link } from 'react-router-dom';
import { Thermometer, Droplets, Leaf, Brain, TrendingUp, Shield } from 'lucide-react';

/* Components */
import Header from '../components/Header';

function Home(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50 dark:bg-gray-900 flex flex-col">
            <Header />
            <div className="flex-1 flex w-full items-center justify-center flex-col space-y-8 p-6">
                <div className="text-center space-y-4">
                    <h1 className="font-bold text-5xl text-gray-900 dark:text-white">Smart Agricultural Weather System</h1>
                    <p className='max-w-2xl text-center text-lg text-gray-600 dark:text-gray-300'>
                        AI-powered weather monitoring and agricultural insights for precision farming
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                    {/* Temperature Monitoring */}
                    <Link to="/temperature" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <Thermometer className="h-8 w-8 text-red-500" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Temperature Monitoring</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                Real-time temperature tracking with historical data analysis and trend visualization.
                            </p>
                        </div>
                    </Link>

                    {/* Humidity Tracking */}
                    <Link to="/humidity" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <Droplets className="h-8 w-8 text-blue-500" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Humidity Analysis</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                Monitor humidity levels and their impact on crop health and disease prevention.
                            </p>
                        </div>
                    </Link>

                    {/* AI Crop Advisor */}
                    <Link to="/crop-advisor" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <Brain className="h-8 w-8 text-green-500" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Crop Advisor</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                Get AI-powered insights on how weather affects specific crops with actionable recommendations.
                            </p>
                        </div>
                    </Link>

                    {/* Smart Irrigation */}
                    <Link to="/irrigation-advisor" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <Leaf className="h-8 w-8 text-emerald-500" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Irrigation</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                Weather-based irrigation recommendations for optimal water management and crop health.
                            </p>
                        </div>
                    </Link>

                    {/* Weather Forecasting */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Weather Forecasting</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            ML-powered temperature predictions and weather trend analysis for planning.
                        </p>
                    </div>

                    {/* Precision Agriculture */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <Shield className="h-8 w-8 text-orange-500" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Precision Agriculture</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Data-driven farming decisions with comprehensive weather monitoring and analysis.
                        </p>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">Real-time weather data collection</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">AI-powered crop analysis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">Smart irrigation recommendations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">Historical data tracking</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">Multi-parameter weather monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 dark:text-gray-300">Precision agriculture insights</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;