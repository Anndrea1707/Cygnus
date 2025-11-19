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
  const [rol, setRol] = useState("publico");
  const [usuarioActual, setUsuarioActual] = useState(usuario);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const parsed = JSON.parse(usuarioGuardado);
        setUsuarioActual(parsed);
        setRol(parsed.rol === "admin" ? "admin" : "usuario");
      } catch (error) {
        localStorage.removeItem("usuario");
        setUsuarioActual(null);
        setRol("publico");
      }
    } else {
      setUsuarioActual(usuario);
      setRol("publico");
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      setUsuarioActual(usuario);
      setRol(usuario.rol === "admin" ? "admin" : "usuario");
    } else {
      setUsuarioActual(null);
      setRol("publico");
    }
  }, [usuario]);

  const nombreUsuario =
    usuarioActual?.apodo || usuarioActual?.nombre_completo || "Usuario";
  const avatarUsuario =
    usuarioActual?.avatar ||
    "https://cdn-icons-png.flaticon.com/128/1068/1068549.png";

  const confirmarLogout = () => setMostrarModal(true);
  const cancelarLogout = () => setMostrarModal(false);
  const aceptarLogout = () => {
    setMostrarModal(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      <nav className="navbar">
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

        <ul className="nav-links">
          {rol === "publico" && (
            <>
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
              <li>
                <button
                  className={currentPage === "ayuda" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("ayuda")}
                >
                  Ayuda
                </button>
              </li>
            </>
          )}

          {rol === "usuario" && (
            <>
              <li>
                <button
                  className={currentPage === "dashboard" ? "nav-btn active" : "nav-btn"}
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
                <button className={currentPage === "biblioteca" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("biblioteca")}
                >
                  Biblioteca
                </button>
              </li>
            </>
          )}

          {rol === "admin" && (
            <>
              <li>
                <button
                  className={currentPage === "paneladmin" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("paneladmin")}
                >
                  Panel
                </button>
              </li>
              <li>
                <button className="nav-btn" disabled>
                  Cursos
                </button>
              </li>
              <li>
                <button
                  className={currentPage === "adminusuarios" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("adminusuarios")}
                >
                  Usuarios
                </button>
              </li>
              <li>
                <button
                  className={currentPage === "usuarios" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("usuarios")}
                >
                  Avatares
                </button>
              </li>
              <li>
                <button
                  className={currentPage === "bibliotecaadmin" ? "nav-btn active" : "nav-btn"}
                  onClick={() => onNavigate("bibliotecaadmin")}
                >
                  Biblioteca
                </button>
              </li>
            </>
          )}
        </ul>

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
              <img src={avatarUsuario} alt="Usuario" className="dashboard-avatar" />
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
