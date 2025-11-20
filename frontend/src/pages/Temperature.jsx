import React from 'react';
import Content from '../components/Content';
import Header from '../components/Header';
import TemperaturePrediction from '../components/TemperaturePrediction';
import WeeklyStats from '../components/WeeklyStats';
import AiInsightsCard from '../components/AiInsightsCard';

function Temperature(){
    return(
        <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-6xl mx-auto flex flex-col gap-8 py-8">
        <Content />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TemperaturePrediction />
          <WeeklyStats />
          <div className="md:col-span-2">
            <AiInsightsCard />
          </div>
        </section>
      </main>
    </div>
    )
}

export default Temperature;