import React from 'react';
import HumidityContent from '../components/HumidityContent';
import WeeklyHumidityStats from '../components/WeeklyHumidityStats';

function Humidity() {
  return (
    <div className="flex flex-col gap-8">
      <HumidityContent />
      <WeeklyHumidityStats />
    </div>
  );
}

export default Humidity;