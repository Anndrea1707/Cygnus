import React, { useState } from "react";
import "./CursosPrincipal.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";

export default function CursosPrincipal({ currentPage, onLoginClick, onNavigate }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  const cursos = [
    {
      titulo: "Diseño de Interfaces Modernas",
      descripcion:
        "Crea interfaces atractivas, intuitivas y funcionales que conecten con tus usuarios. Aprende sobre tipografía, jerarquía visual y herramientas de diseño modernas.",
      imagen:
        "https://www.hostingplus.com.co/wp-content/uploads/2021/07/businessman-using-tech-devices-and-icons-thin-line-interface.jpg",
      nivel: "Básico",
      duracion: "4 semanas",
    },
    {
      titulo: "Desarrollo Web con React",
      descripcion:
        "Construye aplicaciones web interactivas con React, una de las librerías más potentes del mundo. Domina el uso de componentes, hooks, y el manejo del estado.",
      imagen:
        "https://jhasenstudio.com/wp-content/uploads/2024/10/desarrollo-web-scaled.jpg",
      nivel: "Intermedio",
      duracion: "6 semanas",
    },
    {
      titulo: "Análisis de Datos",
      descripcion:
        "Domina las herramientas esenciales para procesar, visualizar y analizar datos de forma eficiente. Incluye Power BI, Excel y Python.",
      imagen:
        "https://www.dqsconsulting.com/wp-content/uploads/2021/09/como-hacer-un-analisis-de-datos.jpg",
      nivel: "Intermedio",
      duracion: "5 semanas",
    },
    {
      titulo: "Inteligencia Artificial",
      descripcion:
        "Aprende cómo entrenar modelos de IA y aplicarlos a problemas del mundo real. Conoce los fundamentos del aprendizaje automático y redes neuronales.",
      imagen:
        "https://img.computing.es/wp-content/uploads/2024/03/22155324/IA-2.jpg",
      nivel: "Avanzado",
      duracion: "8 semanas",
    },
    {
      titulo: "Ciberseguridad Básica",
      descripcion:
        "Descubre los fundamentos para proteger sistemas y redes frente a ataques digitales. Aprende sobre contraseñas, encriptación y seguridad en la nube.",
      imagen:
        "https://latam.kaspersky.com/content/es-mx/images/repository/isc/2020/cyber-security-article.jpg",
      nivel: "Básico",
      duracion: "3 semanas",
    },
    {
      titulo: "Bases de Datos con MongoDB",
      descripcion:
        "Aprende a estructurar, consultar y escalar bases de datos NoSQL modernas. Explora la integración de MongoDB con Node.js y React.",
      imagen:
        "https://img.datacentermarket.es/wp-content/uploads/2025/01/16110626/Bases-de-datos-como-Servicio-1.jpeg",
      nivel: "Intermedio",
      duracion: "5 semanas",
    },
  ];

  return (
    <div className="cursos-principal">
      {/* === NAVBAR === */}
      <NavbarPrincipal
        currentPage={currentPage}
        onLoginClick={onLoginClick}
        onNavigate={onNavigate}
      />

      {/* === HERO === */}
      <section className="hero-cursos">
        <div className="hero-contenido">
          <h1>Descubre nuestros cursos</h1>
          <p>
            Explora nuestras áreas de aprendizaje y conoce cómo puedes potenciar tu conocimiento.
            No necesitas iniciar sesión para explorar la oferta educativa.
          </p>
          <button className="btn-principal" onClick={onLoginClick}>
            Inicia sesión para comenzar
          </button>
        </div>
      </section>

      {/* === GRID DE CURSOS === */}
      <section className="seccion-cursos">
        <h2 className="titulo-seccion">Explora los cursos disponibles</h2>
        <div className="grid-cursos">
          {cursos.map((curso, index) => (
            <div key={index} className="tarjeta-curso">
              <img src={curso.imagen} alt={curso.titulo} className="imagen-curso" />
              <div className="contenido-curso">
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
                <span className="etiqueta-nivel">Nivel {curso.nivel}</span>
                <button
                  className="btn-detalles"
                  onClick={() => setCursoSeleccionado(curso)}
                >
                  Ver más detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === MODAL DETALLES === */}
      {cursoSeleccionado && (
        <div className="modal-overlay" onClick={() => setCursoSeleccionado(null)}>
          <div
            className="modal-detalle"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-cerrar"
              onClick={() => setCursoSeleccionado(null)}
            >
              ✖
            </button>
            <img
              src={cursoSeleccionado.imagen}
              alt={cursoSeleccionado.titulo}
              className="modal-imagen"
            />
            <h2>{cursoSeleccionado.titulo}</h2>
            <p>{cursoSeleccionado.descripcion}</p>
            <p><strong>Nivel:</strong> {cursoSeleccionado.nivel}</p>
            <p><strong>Duración:</strong> {cursoSeleccionado.duracion}</p>
            <button className="btn-principal" onClick={onLoginClick}>
              Inicia sesión para inscribirte
            </button>
          </div>
        </div>
      )}

      {/* === SECCIÓN POR QUÉ NOSOTROS === */}
      <section className="por-que-nosotros">
        <h2>¿Por qué aprender con Cygnus?</h2>
        <div className="tarjetas-info">
          <div className="tarjeta-info">
            <h4>📊 Aprendizaje adaptativo</h4>
            <p>Contenido que evoluciona según tu ritmo de aprendizaje.</p>
          </div>
          <div className="tarjeta-info">
            <h4>💡 Contenidos actualizados</h4>
            <p>Material diseñado por expertos en educación digital.</p>
          </div>
          <div className="tarjeta-info">
            <h4>⚡ 100% en línea</h4>
            <p>Aprende donde quieras, cuando quieras.</p>
          </div>
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="cta-final">
        <h2>¿Listo para comenzar tu aprendizaje?</h2>
        <button className="btn-principal" onClick={onLoginClick}>
          Crea tu cuenta gratuita
        </button>
      </section>

      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}
