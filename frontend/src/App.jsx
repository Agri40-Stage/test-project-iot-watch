import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";

import Layout from './components/Layout';

import Temperature from "./pages/Temperature";
import Humidity from './pages/Humidity';
import Forecast from './components/Forecast';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="temperature" element={<Temperature />} />
        <Route path="humidity" element={<Humidity />} />
        <Route path="forecast" element={<Forecast />} />
      </Route>
    </Routes>
  );
}

export default App;