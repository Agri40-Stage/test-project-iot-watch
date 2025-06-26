import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
import TemperatureMap from '../components/TemperatureMap';
import TemperatureStatsBox from '../components/TemperatureStatsBox';
import BotInsight from '../components/BotInsight';
function Temperature(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <Content />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-6 px-6">
        <div className="xl:col-span-1">
          <TemperatureMap />
        </div>
        <div className="xl:col-span-2">
          <TemperatureStatsBox />
        </div>
        <div className="xl:col-span-3">
          <BotInsight />
        </div>
      </div>
      {/* <TemperaturePrediction />
      <WeeklyStats /> */}
    </div>
    )
}

export default Temperature;