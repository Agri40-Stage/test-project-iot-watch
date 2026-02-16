import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";

/*Pages */
import Temperature from "./pages/Temperature"
import Humidity from './pages/Humidity';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';


function App() {

  return (

    
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/temperature" element={<ProtectedRoute><Temperature /></ProtectedRoute>} />
        <Route path="/humidity" element={<ProtectedRoute><Humidity /></ProtectedRoute>} />
      </Routes>
    
    
  )
}

export default App;
