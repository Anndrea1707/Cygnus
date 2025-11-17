// src/pages/PanelAdmin.jsx
import React from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./PanelAdmin.css";

export default function PanelAdmin({ usuario, onLogout, onNavigate }) {
  const nombre = usuario?.apodo || usuario?.nombre_completo || "Administrador";

  return (
    <div className="paneladmin-background">
      {/* NAVBAR */}
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="paneladmin"
      />

      {/* CONTENIDO */}
      <div className="paneladmin-content">
        <h2>🔐 Bienvenido al Panel de Administración</h2>
        <p>
          Hola <strong>{nombre}</strong>, aquí podrás gestionar recursos, cursos,
          usuarios y toda la configuración avanzada de la plataforma Cygnus.
        </p>
        <p className="paneladmin-subtext">
          Selecciona una opción del menú para comenzar.
        </p>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
