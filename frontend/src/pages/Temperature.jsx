import React from 'react';

/* Components */
import Content from '../components/Content';
import Header from '../components/Header';
import TemperaturePrediction from '../components/Temperature_prediction';
// import WeeklyStats from '../components/WeeklyStats';

function Temperature() {
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50">
      <Header />
      
      {/* Section principale existante */}
      <Content />
      
      {/* Nouvelle section pour les prévisions */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Prévisions météo
          </h2>
          <TemperaturePrediction />
        </div>
      </section>

      {/* <WeeklyStats /> */}
    </div>
  );
}

export default Temperature;