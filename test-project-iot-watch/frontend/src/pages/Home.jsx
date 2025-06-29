import React from 'react';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';
import WeatherDashboard from '../components/WeatherDashboard';
import CorsTest from '../components/CorsTest';
import AiIotDashboard from '../components/AiIotDashboard';

function Home(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50 flex flex-col">
            <Header />
            <div className="flex-1 flex w-full items-center justify-center flex-col space-y-4 p-4">
                <h1 className="font-bold text-5xl">Welcome Home</h1>
                <p className='max-w-xl text-center mb-8'>You can navigate through the navbar above to get different temperature data visualizers for the past 7 days.</p>
                
                {/* CORS Test Component */}
                <div className="w-full max-w-md mb-8">
                    <CorsTest />
                </div>
                
                {/* Real-time Weather Dashboard */}
                <div className="w-full max-w-6xl mb-8">
                    <WeatherDashboard />
                </div>
                
                {/* AI & IoT Dashboard */}
                <div className="w-full max-w-6xl">
                    <AiIotDashboard />
                </div>
            </div>
        </div>
    )
}

export default Home;