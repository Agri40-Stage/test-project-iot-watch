import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

/*Pages */
import Temperature from "./pages/Temperature"
import Humidity from './pages/Humidity';
import Home from './pages/Home';
import CropAdvisorPage from './pages/CropAdvisor';
import IrrigationAdvisorPage from './pages/IrrigationAdvisor';


function App() {

  return (

    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/humidity" element={<Humidity />} />
        <Route path="/crop-advisor" element={<CropAdvisorPage />} />
        <Route path="/irrigation-advisor" element={<IrrigationAdvisorPage />} />
      </Routes>
    
    
  )
}

export default App;
