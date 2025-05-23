import React from 'react';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';

function Humidity(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <div className='flex '>

      <HumidityChart/>

      </div>
    </div>
    )
}

export default Humidity;