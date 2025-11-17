import React, { useState } from "react";
import "./Dashboard.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import SoportePanel from "../components/SoportePanel";

function Dashboard({ usuario, onLogout, onNavigate }) {
  const [mostrarSoporte, setMostrarSoporte] = useState(false);

  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";

  return (
    <div className="dashboard-background">
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="dashboard"
      />

      <div className="dashboard-content">
        <h2>🌟 Bienvenido, {nombreUsuario} 🌟</h2>
        <p>
          Nos alegra tenerte aquí. Desde este panel podrás acceder a todas tus
          herramientas y secciones de Cygnus.
        </p>
      </div>

      {/* === BOTÓN FLOTANTE DE AYUDA === */}
      <button className="btn-ayuda-flotante" onClick={() => setMostrarSoporte(true)}>
        <img
          src="https://cdn-icons-png.flaticon.com/128/5726/5726775.png"
          alt="soporte"
        />
      </button>


      {/* === PANEL LATERAL DE AYUDA === */}
      {mostrarSoporte && (
        <SoportePanel
          onClose={() => setMostrarSoporte(false)}
          usuario={usuario}   // 👈 AGREGA ESTO
        />
      )}


      <Footer />
    </div>
  );
}

export default Dashboard;
