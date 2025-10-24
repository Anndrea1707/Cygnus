// src/App.jsx
import React, { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import SobreNosotros from "./pages/SobreNosotros";
import Ayuda from "./pages/Ayuda";
import Dashboard from "./pages/Dashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("home"); // ✅ Siempre empieza en "home"
  const [usuario, setUsuario] = useState(null);

  // 🔹 Funciones de navegación
  const handleNavigate = (page) => setCurrentPage(page);
  const handleLoginClick = () => setCurrentPage("login");

  // 🔹 Al iniciar sesión exitosamente
  const handleLoginSuccess = (userData) => {
    setUsuario(userData);
    localStorage.setItem("usuario", JSON.stringify(userData)); // opcional: guardar para persistencia futura
    setCurrentPage("dashboard");
  };

  // 🔹 Al cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCurrentPage("home");
  };

  // 🔹 Renderizado por página
  switch (currentPage) {
    case "dashboard":
      return <Dashboard usuario={usuario} onLogout={handleLogout} onNavigate={handleNavigate} />;

    case "login":
      return (
        <Login
          onBackToHome={() => setCurrentPage("home")}
          onRegisterClick={() => setCurrentPage("registro")}
          onLoginSuccess={handleLoginSuccess}
        />
      );

    case "registro":
      return <Registro onBackToLogin={() => setCurrentPage("login")} />;

    case "sobreNosotros":
      return <SobreNosotros onNavigate={handleNavigate} onLoginClick={handleLoginClick} />;

    case "ayuda":
      return <Ayuda onNavigate={handleNavigate} onLoginClick={handleLoginClick} />;

    default:
      return <Home onNavigate={handleNavigate} onLoginClick={handleLoginClick} />;
  }
}

export default App;