// src/pages/PanelAdmin.jsx
import React, { useState, useEffect } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./PanelAdmin.css";

export default function PanelAdmin({ usuario, onLogout, onNavigate }) {
  const nombre = usuario?.apodo || usuario?.nombre_completo || "Administrador";
  const [fraseActual, setFraseActual] = useState(0);
  const [tarjetaActual, setTarjetaActual] = useState(0);

  // Frases motivadoras para el administrador
  const frasesMotivadoras = [
    "¡Lidera el cambio educativo! 🌟",
    "Tu trabajo transforma vidas 💫",
    "Cada ajuste que haces mejora la experiencia de aprendizaje 🚀",
    "Eres el arquitecto del conocimiento 🏛️",
    "Inspiras, guías y construyes el futuro 📚"
  ];

  // Tarjetas dinámicas con las funcionalidades
  const tarjetasFuncionalidades = [
    {
      titulo: "👥 Gestión de Usuarios",
      descripcion: "Administra todos los usuarios del sistema, modifica permisos, revisa progresos y gestiona sus cuentas.",
      accion: "Gestionar Usuarios",
      destino: "adminusuarios"
    },
    {
      titulo: "📚 Gestión de Cursos",
      descripcion: "Crea nuevos cursos, modifica contenido existente y organiza el material educativo.",
      accion: "Gestionar Cursos",
      destino: "cursosadmin"
    },
    {
      titulo: "📖 Biblioteca Digital",
      descripcion: "Administra los recursos bibliográficos, añade nuevos materiales y organiza el contenido.",
      accion: "Gestionar Biblioteca",
      destino: "bibliotecaadmin"
    },
  ];

  // Rotación automática de frases
  useEffect(() => {
    const intervaloFrases = setInterval(() => {
      setFraseActual((prev) => (prev + 1) % frasesMotivadoras.length);
    }, 5000);

    return () => clearInterval(intervaloFrases);
  }, []);

  // Rotación automática de tarjetas
  useEffect(() => {
    const intervaloTarjetas = setInterval(() => {
      setTarjetaActual((prev) => (prev + 1) % tarjetasFuncionalidades.length);
    }, 8000);

    return () => clearInterval(intervaloTarjetas);
  }, []);

  const navegarA = (destino) => {
    onNavigate(destino);
  };

  const siguienteTarjeta = () => {
    setTarjetaActual((prev) => (prev + 1) % tarjetasFuncionalidades.length);
  };

  const anteriorTarjeta = () => {
    setTarjetaActual((prev) => (prev - 1 + tarjetasFuncionalidades.length) % tarjetasFuncionalidades.length);
  };

  return (
    <div className="paneladmin-background">
      {/* NAVBAR */}
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="paneladmin"
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="paneladmin-content">

        {/* ENCABEZADO BIENVENIDA */}
        <div className="paneladmin-header">
          <h2>🔐 Bienvenido al Panel de Administración</h2>
          <p>
            Hola <strong>{nombre}</strong>, aquí podrás gestionar recursos, cursos,
            usuarios y toda la configuración avanzada de la plataforma Cygnus.
          </p>
        </div>

        {/* FRASE MOTIVADORA */}
        <div className="frase-motivadora">
          <div className="frase-contenedor">
            <h3 className="frase-texto">{frasesMotivadoras[fraseActual]}</h3>
            <div className="frase-indicadores">
              {frasesMotivadoras.map((_, index) => (
                <span
                  key={index}
                  className={`indicador ${index === fraseActual ? 'activo' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TARJETAS DINÁMICAS */}
        <div className="tarjetas-seccion">
          <h3 className="tarjetas-titulo">¿Qué puedes hacer hoy?</h3>

          <div className="tarjetas-contenedor">
            <button className="tarjeta-nav-btn anterior" onClick={anteriorTarjeta}>
              ‹
            </button>

            <div className="tarjeta-activa">
              <div className="tarjeta-icono">{tarjetasFuncionalidades[tarjetaActual].titulo.split(' ')[0]}</div>
              <h4>{tarjetasFuncionalidades[tarjetaActual].titulo}</h4>
              <p>{tarjetasFuncionalidades[tarjetaActual].descripcion}</p>
              <button
                className="tarjeta-boton"
                onClick={() => navegarA(tarjetasFuncionalidades[tarjetaActual].destino)}
              >
                {tarjetasFuncionalidades[tarjetaActual].accion}
              </button>
            </div>

            <button className="tarjeta-nav-btn siguiente" onClick={siguienteTarjeta}>
              ›
            </button>
          </div>

          <div className="tarjetas-indicadores">
            {tarjetasFuncionalidades.map((_, index) => (
              <span
                key={index}
                className={`tarjeta-indicador ${index === tarjetaActual ? 'activo' : ''}`}
                onClick={() => setTarjetaActual(index)}
              />
            ))}
          </div>
        </div>

        <div className="pruebas-seccion">
          <div className="pruebas-header">
            <h3>📊 Gestión de Pruebas de Conocimiento</h3>
            <p>Crea y administra evaluaciones para los estudiantes</p>
          </div>

          <div className="pruebas-grid">
            <div className="prueba-card">
              <h4>Crear Nueva Prueba</h4>
              <p>Diseña una nueva evaluación con 5 preguntas</p>
              <button
                className="prueba-boton"
                onClick={() => onNavigate("crearprueba")}
              >
                Crear Prueba
              </button>
            </div>

            <div className="prueba-card">
              <h4>Gestionar Pruebas</h4>
              <p>Revisa, edita o elimina pruebas existentes</p>
              <button
                className="prueba-boton"
                onClick={() => onNavigate("gestionarpruebas")}
              >
                Gestionar Pruebas
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}