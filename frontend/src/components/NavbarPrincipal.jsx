import React, { useState, useEffect } from "react";
import logo from "../imagenes/logo.png";
import "./NavbarPrincipal.css";

export default function NavbarPrincipal({
  currentPage,
  onLoginClick,
  onNavigate,
  usuario,
  onLogout,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rol, setRol] = useState("publico"); // publico | usuario | admin

  // Detectar tipo de usuario según correo
  useEffect(() => {
    if (!usuario) {
      setRol("publico");
    } else if (usuario.email === "admin@cygnus.com") {
      setRol("admin");
    } else {
      setRol("usuario");
    }
  }, [usuario]);

  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";

  // 🔹 Abrir modal de confirmación
  const confirmarLogout = () => {
    setMostrarModal(true);
  };

  // 🔹 Cancelar cierre de sesión
  const cancelarLogout = () => {
    setMostrarModal(false);
  };

  // 🔹 Confirmar cierre de sesión
  const aceptarLogout = () => {
    setMostrarModal(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <nav className="navbar">
        {/* === LOGO === */}
        <div
          className="logo-section"
          onClick={() =>
            rol === "usuario"
              ? onNavigate("dashboard")
              : rol === "admin"
              ? onNavigate("panelAdmin")
              : onNavigate("home")
          }
        >
          <img src={logo} alt="Logo Cygnus" className="logo-img" />
          <span className="logo-text">CYGNUS</span>
        </div>

        {/* === ENLACES NAV === */}
        <ul className="nav-links">
          {/* --- Público --- */}
          {rol === "publico" && (
            <>
              <li>
                <button
                  className={
                    currentPage === "home" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("home")}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  className={
                    currentPage === "cursos" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("cursos")}
                >
                  Cursos
                </button>
              </li>
              <li>
                <button
                  className={
                    currentPage === "sobreNosotros"
                      ? "nav-btn active"
                      : "nav-btn"
                  }
                  onClick={() => onNavigate("sobreNosotros")}
                >
                  Sobre nosotros
                </button>
              </li>
              <li>
                <button
                  className={
                    currentPage === "ayuda" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("ayuda")}
                >
                  Ayuda
                </button>
              </li>
            </>
          )}

          {/* --- Usuario autenticado --- */}
          {rol === "usuario" && (
            <>
              <li>
                <button
                  className={
                    currentPage === "dashboard" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("dashboard")}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button className="nav-btn" disabled>
                  Cursos
                </button>
              </li>
              <li>
                <button className="nav-btn" disabled>
                  Ayuda
                </button>
              </li>
            </>
          )}

          {/* --- Administrador --- */}
          {rol === "admin" && (
            <>
              <li>
                <button
                  className={
                    currentPage === "panelAdmin" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("panelAdmin")}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button className="nav-btn" disabled>
                  Cursos
                </button>
              </li>
              <li>
                <button
                  className={
                    currentPage === "usuarios" ? "nav-btn active" : "nav-btn"
                  }
                  onClick={() => onNavigate("usuarios")}
                >
                  Usuarios
                </button>
              </li>
            </>
          )}
        </ul>

        {/* === LOGIN o MENÚ DE USUARIO === */}
        {rol === "publico" ? (
          <button className="btn-login" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        ) : (
          <div className="dashboard-user">
            <div
              className="user-info"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/128/1068/1068549.png"
                alt="Usuario"
                className="dashboard-avatar"
              />
              <span className="dashboard-nombre">{nombreUsuario}</span>
              <span className="arrow">&#9662;</span>
            </div>

            {menuAbierto && (
              <div className="user-menu">
                <button onClick={() => onNavigate("perfil")}>Ver perfil</button>
                <button onClick={confirmarLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* === MODAL DE CONFIRMACIÓN === */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Seguro que deseas cerrar sesión?</h3>
            <p>Tu sesión se cerrará y volverás a la vista principal.</p>
            <div className="modal-buttons">
              <button className="btn-cancelar" onClick={cancelarLogout}>
                Cancelar
              </button>
              <button className="btn-aceptar" onClick={aceptarLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
