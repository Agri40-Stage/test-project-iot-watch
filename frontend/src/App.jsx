import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Pages */
import Temperature from "./pages/Temperature";
import Humidity from './pages/Humidity';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Alerts from './pages/Alerts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/temperature" element={<Temperature />} />
      <Route path="/humidity" element={<Humidity />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/alerts" element={<Alerts />} />
    </Routes>
  );
}

export default App;
