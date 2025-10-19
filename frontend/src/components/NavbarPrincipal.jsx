import React from "react";
import logo from "../imagenes/logo.png";
import "./NavbarPrincipal.css";

export default function NavbarPrincipal({ currentPage, onLoginClick, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="logo-section">
        <img src={logo} alt="Logo Cygnus" className="logo-img" />
        <span className="logo-text">CYGNUS</span>
      </div>

      <ul className="nav-links">
        <li>
          <button
            className={currentPage === "home" ? "nav-btn active" : "nav-btn"}
            onClick={() => onNavigate("home")}
          >
            Inicio
          </button>
        </li>

        <li>
          <button
            className={currentPage === "cursos" ? "nav-btn active" : "nav-btn"}
            onClick={() => onNavigate("cursos")}
          >
            Cursos
          </button>
        </li>

        <li>
          <button
            className={currentPage === "sobreNosotros" ? "nav-btn active" : "nav-btn"}
            onClick={() => onNavigate("sobreNosotros")}
          >
            Sobre nosotros
          </button>
        </li>
      </ul>

      <button className="btn-login" onClick={onLoginClick}>
        Iniciar Sesión
      </button>
    </nav>
  );
}
