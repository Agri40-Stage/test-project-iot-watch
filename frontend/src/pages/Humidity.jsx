import React, { useState, useEffect } from 'react';
import { getCurrentWeather } from '../api/irrigation';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';

function Humidity(){
    const [currentHumidity, setCurrentHumidity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentHumidity = async () => {
            try {
                const weatherData = await getCurrentWeather();
                setCurrentHumidity(weatherData.humidity);
            } catch (error) {
                console.error('Error fetching current humidity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentHumidity();
    }, []);

    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50 dark:bg-gray-900">
            <Header />
            
            {/* Current Humidity Display */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Current Humidity</h2>
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700 dark:text-gray-300">Loading current humidity...</span>
                        </div>
                    ) : currentHumidity !== null ? (
                        <div className="flex items-center space-x-4">
                            <div className="text-6xl text-blue-500">💧</div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">{currentHumidity}%</div>
                                <div className="text-gray-600 dark:text-gray-300">Real-time humidity in Agadir</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-600 dark:text-gray-300">Unable to load current humidity data</div>
                    )}
                </div>
            </div>

            {/* Humidity Chart */}
            <div className='flex justify-center items-center'>
                <HumidityChart/>
            </div>
        </div>
    )
}

export default Humidity;