import React, { useState, useEffect } from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
import Spinner from '../components/Spinner';
// import TemperaturePrediction from '../components/TemperaturePrediction';
// import WeeklyStats from '../components/WeeklyStats';

function Temperature(){
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
      {isLoading ? <Spinner /> : <Content />}
      {/* <TemperaturePrediction />
      <WeeklyStats /> */}
    </div>
  )
}

export default Temperature;