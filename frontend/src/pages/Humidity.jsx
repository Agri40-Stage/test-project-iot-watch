import React from 'react';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';
import HumidityPrediction from '../components/HumidityPrediction';

function Humidity(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
            <Header />
            <div className='p-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Current Humidity Chart */}
                    <div className="h-[400px]">
                        <HumidityChart/>
                    </div>
                    
                    {/* Humidity Prediction Chart */}
                    <div className="h-[400px]">
                        <HumidityPrediction/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Humidity;