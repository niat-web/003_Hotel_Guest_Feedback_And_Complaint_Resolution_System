import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./components/HomePage";
import ManagerLogin from "./components/ManagerLogin";
import ManagerDashboard from "./components/ManagerDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/manager/login" element={<ManagerLogin />} />

        <Route path="/manager/dashboard" element={<ManagerDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;