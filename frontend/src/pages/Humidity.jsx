import React, { useState, useEffect } from 'react';

/* Components */
import Header from '../components/Header';
import HumidityChart from '../components/HumidityChart';
import Spinner from '../components/Spinner';

function Humidity(){
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return(
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <div className='flex justify-center items-center'>
        {isLoading ? <Spinner /> : <HumidityChart />}
      </div>
    </div>
  )
}

export default Humidity;