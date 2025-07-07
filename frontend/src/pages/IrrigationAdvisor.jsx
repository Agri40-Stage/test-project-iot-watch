import React from 'react';
import Header from '../components/Header';
import IrrigationAdvisor from '../components/IrrigationAdvisor';

function IrrigationAdvisorPage() {
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50 dark:bg-gray-900">
      <Header />
      <IrrigationAdvisor />
    </div>
  );
}

export default IrrigationAdvisorPage; 