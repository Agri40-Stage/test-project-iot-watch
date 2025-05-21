import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

/*Pages */
import Temperature from "./pages/Temperature"




function App() {

  return (

    
      <Routes>
        <Route path="/" element={<Temperature />} />
      </Routes>
    
    
  )
}

export default App;
