// src/App.jsx
import React, { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import SobreNosotros from "./pages/SobreNosotros";
import Ayuda from "./pages/Ayuda";
import Dashboard from "./pages/Dashboard";
import CursosPrincipal from "./pages/CursosPrincipal";
import Perfil from "./pages/Perfil";
import Encuesta from "./components/Encuesta";
import PanelAdmin from "./pages/PanelAdmin";
import Biblioteca from "./pages/BibliotecaAdmin";


function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [usuario, setUsuario] = useState(null);

  const handleNavigate = (page) => setCurrentPage(page);
  const handleLoginClick = () => setCurrentPage("login");

  const handleLoginSuccess = (userData) => {
    setUsuario(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));

    // 👉 Si es administrador, va directo al panel admin
    if (userData.rol === "admin") {
      setCurrentPage("paneladmin");
      return;
    }

    // 👉 Si NO ha hecho la encuesta
    if (!userData.encuesta_inicial?.completada) {
      setCurrentPage("encuesta");
      return;
    }

    // 👉 Si es usuario normal y ya hizo la encuesta
    setCurrentPage("dashboard");
  };



  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCurrentPage("home");
  };

  switch (currentPage) {
    case "dashboard":
      return (
        <Dashboard
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage} // ✅ añadido
        />
      );

    case "perfil":
      return (
        <Perfil
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      );


    case "login":
      return (
        <Login
          onBackToHome={() => setCurrentPage("home")}
          onRegisterClick={() => setCurrentPage("registro")}
          onLoginSuccess={handleLoginSuccess}
          currentPage={currentPage} // ✅ añadido
        />
      );

    case "registro":
      return (
        <Registro
          onBackToLogin={() => setCurrentPage("login")}
          currentPage={currentPage} // ✅ añadido
        />
      );

    case "sobreNosotros":
      return (
        <SobreNosotros
          currentPage={currentPage} // ✅ añadido
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );

    case "ayuda":
      return (
        <Ayuda
          currentPage={currentPage} // ✅ añadido
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );

    case "cursos":
      return (
        <CursosPrincipal
          currentPage={currentPage} // ✅ añadido
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      )

    case "encuesta":
      return (
        <Encuesta
          usuario={usuario}
          onEncuestaCompletada={() => setCurrentPage("dashboard")}
        />
      );

    case "paneladmin":
      return (
        <PanelAdmin
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );

    case "bibliotecaadmin":
      return (
        <Biblioteca
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );

    default:
      return (
        <Home
          currentPage={currentPage} // ✅ añadido
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );
  }
}

export default App;
