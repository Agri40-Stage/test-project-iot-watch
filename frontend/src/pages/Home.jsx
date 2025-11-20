import React from 'react';
import Header from '../components/Header';
import LoginCard from '../components/LoginCard';
import HumidityChart from '../components/HumidityChart';

function Home(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50 flex flex-col">
            <Header />
            <div className="flex-1 flex w-full items-center justify-center flex-col space-y-8 px-4">
                <div className="text-center max-w-3xl space-y-4">
                    <p className="text-sm uppercase tracking-[0.4em] text-orange-500">IoT Temp Watch</p>
                    <h1 className="font-bold text-5xl">Real-time sensor telemetry with AI insights</h1>
                    <p className='max-w-2xl text-center text-gray-600 mx-auto'>
                        Authenticate to stream the latest Open-Meteo readings, trigger on-device ML forecasts,
                        and summarize the situation with an LLM-powered assistant. Humidity analytics and
                        security-first JWT protection are enabled out of the box.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <LoginCard />
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Humidity Snapshot</h3>
                        <HumidityChart className="h-64" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;