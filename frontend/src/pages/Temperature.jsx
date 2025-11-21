import React from 'react';
import Content from '../components/Content';
import TemperaturePrediction from '../components/TemperaturePrediction';
import WeeklyStats from '../components/WeeklyStats';

function Temperature() {
  // The Header and main wrapper div are now gone.
  return (
    <div className="flex flex-col gap-8">
      <Content />
      <WeeklyStats />
    </div>
  );
}

export default Temperature;