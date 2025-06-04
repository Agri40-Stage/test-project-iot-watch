import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
// import TemperaturePrediction from '../components/TemperaturePrediction';
// import WeeklyStats from '../components/WeeklyStats';
import BoxPlotStats from '../components/BoxPlotStats';

function Temperature(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <Content />
      {/* <TemperaturePrediction />
      <WeeklyStats /> */}
      <BoxPlotStats />
    </div>
    )
}

export default Temperature;