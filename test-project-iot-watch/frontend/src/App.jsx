/**
 * IoT Temperature Watch - Main React Application
 * =============================================
 * 
 * This is the root component of the React frontend application.
 * It sets up the routing system and defines the main page structure
 * for the IoT temperature monitoring dashboard.
 * 
 * The application uses React Router for navigation between different
 * pages: Home, Temperature, and Humidity monitoring.
 */

import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

/* Page Components */
import Temperature from "./pages/Temperature"  // Temperature monitoring dashboard
import Humidity from './pages/Humidity';        // Humidity monitoring dashboard
import Home from './pages/Home';                // Landing/home page

function App() {
  return (
    // Main application container with routing setup
    <Routes>
      {/* Route for the home/landing page */}
      <Route path="/" element={<Home />} />
      
      {/* Route for the temperature monitoring dashboard */}
      <Route path="/temperature" element={<Temperature />} />
      
      {/* Route for the humidity monitoring dashboard */}
      <Route path="/humidity" element={<Humidity />} />
    </Routes>
  )
}

export default App;
