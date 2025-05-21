import React from 'react';
import './App.css';

/* Components */
import Content from './components/Content';

function App() {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="w-full h-full">
        <Content />
      </div>
    </div>
  )
}

export default App;
