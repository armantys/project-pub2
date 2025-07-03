import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from "./pages/Register";
import WebcamPage from './pages/WebcamPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';



function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) {
        return { success: false, error: "Identifiants invalides" };
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token); // Tu peux aussi stocker avec context ou cookie
      setIsLoggedIn(true);

      return { success: true };
    } catch (err) {
      return { success: false, error: "Erreur réseau ou serveur" };
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleRegister = async (email: string, password: string) => {
  try {
    const res = await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.detail || "Erreur d'inscription" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Erreur réseau" };
  }
};


  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout onLogout={handleLogout} isLoggedIn={isLoggedIn} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/webcam" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <WebcamPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register onRegister={handleRegister} />
            } />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;