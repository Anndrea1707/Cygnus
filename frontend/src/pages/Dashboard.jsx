import React from "react";
import "./Dashboard.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";

function Dashboard({ usuario, onLogout, onNavigate }) {
  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";

  return (
    <div className="dashboard-background">
      {/* === NAVBAR PRINCIPAL (Global) === */}
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="dashboard"
      />

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="dashboard-content">
        <h2>🌟 Bienvenido, {nombreUsuario} 🌟</h2>
        <p>
          Nos alegra tenerte aquí. Desde este panel podrás acceder a todas tus
          herramientas y secciones de Cygnus.
        </p>
      </div>

      {/* === FOOTER GLOBAL === */}
      <Footer />
    </div>
  );
}

export default Dashboard;
