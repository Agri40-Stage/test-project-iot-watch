import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

/*Pages */
import Temperature from "./pages/Temperature"
import Humidity from './pages/Humidity';


function App() {

  return (

    
      <Routes>
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/humidity" element={<Humidity />} />
      </Routes>
    
    
  )
}

export default App;
