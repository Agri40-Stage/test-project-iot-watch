import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

/*Pages */
import Temperature from "./pages/Temperature"
import HumidityChart from './components/HumidityChart';


function App() {

  return (

    
      <Routes>
        <Route path="/" element={<Temperature />} />
        <Route path="/humidity" element={<HumidityChart />} />
      </Routes>
    
    
  )
}

export default App;
