import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
import ExportButton from '../components/ExportButton';
// import TemperaturePrediction from '../components/TemperaturePrediction';
// import WeeklyStats from '../components/WeeklyStats';

function Temperature(){
    return(
      <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
        <Header />
        <Content />
        <div className="max-w-7xl mx-auto px-4 py-6">
            <ExportButton />
        </div>
        {/* <TemperaturePrediction />
        <WeeklyStats /> */}
      </div>
    )
}

export default Temperature;