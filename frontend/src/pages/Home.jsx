    import React, { useState, useEffect } from 'react';

    /* Components */
    import Header from '../components/Header';
    import TemperatureCrad from '../components/TemperatureCrad';
    import { fetchLatestTemperature } from '../api/latest';

    function Home(){
        const [weatherData, setWeatherData] = useState({
            temperature: null,
            time: null,
            trend: null,
            advice: null
        });

        useEffect(() => {
            const getData = async () => {
                const data = await fetchLatestTemperature();
                if (data) {
                    setWeatherData(data);
                }
            };

            getData();
            const interval = setInterval(getData, 60000); // Update every minute
            return () => clearInterval(interval);
        }, []);

        return(
            <div className="w-screen max-w-screen min-h-screen bg-zinc-50 flex flex-col">
                <Header />
                <div className="flex-1 flex w-full items-center justify-center flex-col space-y-8 p-6">
                    <div className="text-center space-y-2">
                        <h1 className="font-bold text-4xl text-gray-900">Meteo Agadir Dashboard</h1>
                        <p className='text-gray-500'>Live monitoring & AI Agricultural Advice</p>
                    </div>
                    
                    <TemperatureCrad 
                        temperature={weatherData.temperature}
                        time={weatherData.time}
                        trend={weatherData.trend}
                        advice={weatherData.advice}
                    />
                </div>
            </div>
        )
    }

    export default Home;