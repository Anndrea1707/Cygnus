import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./AdminPerfil.css";

function AdminPerfil({ usuario, onLogout, onNavigate }) {
  const [usuarioActual, setUsuarioActual] = useState(usuario);

  useEffect(() => {
    const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLS) setUsuarioActual(usuarioLS);

    // Fondo dinámico (si el admin tiene fondo personalizado)
    const fondoUsuario = usuarioLS?.fondo;
    if (fondoUsuario) {
      document.body.style.backgroundImage = `url(${fondoUsuario})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.transition = "background 0.5s ease";
    } else {
      document.body.style.backgroundImage = "";
    }

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  return (
    <>
      <NavbarPrincipal
        usuario={usuarioActual}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="adminperfil"
      />

      <div className="adminperfil-container">
        {/* TARJETA MORADA DEL ADMIN */}
        <div className="admin-info-card">
          <img
            src={
              usuarioActual?.avatar ||
              "https://cdn-icons-png.flaticon.com/128/4712/4712108.png"
            }
            alt="Avatar"
            className="admin-avatar"
          />

          <h2>{usuarioActual?.nombre_completo}</h2>
          <p>{usuarioActual?.correo}</p>
          <p className="admin-rol">Administrador</p>
        </div>

        {/* OPCIONES */}
        <div className="opciones-grid">
          <div
            className="opcion-tarjeta"
            style={{ backgroundColor: "#6b21a8" }} 
            onClick={() => onNavigate("modificarPerfil")}
          >
            Modificar Perfil
          </div>

          <div
            className="opcion-tarjeta"
            style={{ backgroundColor: "#9333ea" }} 
            onClick={() => onNavigate("gestionarAdmins")}
          >
            Gestionar Administradores
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AdminPerfil;
