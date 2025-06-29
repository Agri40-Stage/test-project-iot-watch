import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
import TemperaturePrediction from '../components/TemperaturePrediction';
import WeeklyStats from '../components/WeeklyStats';

function Temperature(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <Content />
      <div className="px-6 pb-12">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <TemperaturePrediction />
          <WeeklyStats />
        </div>
      </div>
    </div>
    )
}

export default Temperature;