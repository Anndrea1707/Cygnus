import React from "react";
import logo from "../imagenes/logo.png";
import "./Dashboard.css";


const avatarIcon = "https://cdn-icons-png.flaticon.com/128/1068/1068549.png";

function Dashboard({ usuario, onLogout, onNavigate }) {
  return (
    <div className="dashboard-background">
      {/* 🔹 Navbar similar al Home */}
      <nav className="dashboard-navbar">
        <div className="logo-section">
          <img src={logo} alt="Logo Cygnus" className="logo-img" onClick={() => onNavigate("home")} />
          <span className="logo-text">CYGNUS</span>
        </div>
        <ul className="nav-links">
          <li>
            <button className="nav-btn" onClick={() => onNavigate("home")}>
              Inicio
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => onNavigate("sobreNosotros")}>
              Sobre Nosotros
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => onNavigate("ayuda")}>
              Ayuda
            </button>
          </li>
        </ul>
        <div className="dashboard-user">
          <img src={avatarIcon} alt="Usuario" className="dashboard-avatar" />
          <span className="dashboard-nombre">
            {usuario?.nombre_completo || "Usuario"}
          </span>
          <button className="logout-btn" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* 🔹 Contenido principal */}
      <div className="dashboard-content">
        <h2>🌟 Bienvenido, {usuario?.nombre_completo || "Usuario"} 🌟</h2>
        <p>
          Nos alegra tenerte aquí. Desde este panel podrás acceder a todas tus
          herramientas y secciones de Cygnus.
        </p>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>Desarrollado por <strong>Melissa Hernández & Ángel Hernández</strong></p>
          <p>Unidades Tecnológicas de Santander - UTS</p>
          <p>Bucaramanga, Santander</p>
        </div>
        <div className="footer-line"></div>
        <p className="footer-rights">© 2025 Cygnus. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;