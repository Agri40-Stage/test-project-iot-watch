import React from 'react';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';

function Humidity(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <div className='flex justify-center items-center px-4 py-8'>
        <HumidityChart className="max-w-4xl h-[400px]" />
      </div>
    </div>
    )
}

export default Humidity;