import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from './pages/Register.jsx';
import Goal from './pages/Goal.jsx';
import DailyPlan from './pages/DailyPlan.jsx';
import Dashboard from './pages/Dashboard.jsx';
import logo from '../public/dlp-icon.png';
import './App.css';



function App(){
  return(<>
  <div className="fixed-header">
    <div className="heading">
      <img src={logo} alt="" />
      <h1>Daily Learning Planner</h1>
    </div>
  </div>
  <Routes>
     {/* Default route → go to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Goal" element={<Goal />} />
      <Route path="/DailyPlan" element={<DailyPlan />} />
      <Route path="/Dashboard" element={<Dashboard />} />

      {/* Optional: catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
  </>)
}

export default App;