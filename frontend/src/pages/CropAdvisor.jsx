import React from 'react';
import Header from '../components/Header';
import CropAdvisor from '../components/CropAdvisor';

function CropAdvisorPage() {
  return (
    <div className="w-screen max-w-screen min-h-screen bg-zinc-50 dark:bg-gray-900">
      <Header />
      <CropAdvisor />
    </div>
  );
}

export default CropAdvisorPage; 