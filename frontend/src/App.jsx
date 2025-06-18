import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Pages */
import Temperature from "./pages/Temperature";
import Humidity from './pages/Humidity';
import Home from './pages/Home';
import Contact from "./pages/Contact";
import Header from "./components/Header"; // si Header est dans components

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/temperature" element={<Temperature />} />
        <Route path="/humidity" element={<Humidity />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
