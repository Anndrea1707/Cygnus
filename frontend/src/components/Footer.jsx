// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Desarrollado por <strong>Melissa Hernández & Ángel Hernández</strong></p>
        <p>Unidades Tecnológicas de Santander - UTS</p>
        <p>Bucaramanga, Santander</p>
      </div>
      <div className="footer-line"></div>
      <p className="footer-rights">© 2025 Cygnus. Todos los derechos reservados.</p>
    </footer>
  );
}
