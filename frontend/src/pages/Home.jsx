import React from 'react';

import HumidityChart from '../components/HumidityChart';
import ChatInterface from '../components/ChatInterface';

function Home() {
  return (
    <div className="flex-1 flex w-full items-center justify-center flex-col space-y-4">
      <h1 className="font-bold text-5xl">Welcome Home</h1>
      <p className='max-w-xl text-center'>You can navigate through the navbar above to get different temperature data visualizers for the past 7 days.</p>
      <ChatInterface />
    </div>
  );
}

export default Home;