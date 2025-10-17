import React, { useState } from 'react';
import './Home.css';
import cube from '../imagenes/CuboPrincipal.png';
import logo from '../imagenes/logo.png';

const cursos = [
  {
    titulo: "Diseño de Interfaces Modernas",
    descripcion: "Crea interfaces atractivas, intuitivas y funcionales que conecten con tus usuarios.",
    imagen: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9",
  },
  {
    titulo: "Desarrollo Web con React",
    descripcion: "Construye aplicaciones web interactivas con React, una de las librerías más potentes del mundo.",
    imagen: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    titulo: "Análisis de Datos",
    descripcion: "Domina las herramientas esenciales para procesar y analizar datos de forma eficiente.",
    imagen: "https://images.unsplash.com/photo-1556155092-8707de31f9c4",
  },
  {
    titulo: "Inteligencia Artificial",
    descripcion: "Aprende cómo entrenar modelos de IA y aplicarlos a problemas del mundo real.",
    imagen: "https://img.computing.es/wp-content/uploads/2024/03/22155324/IA-2.jpg",
  },
  {
    titulo: "Ciberseguridad Básica",
    descripcion: "Descubre los fundamentos para proteger sistemas y redes frente a ataques digitales.",
    imagen: "https://latam.kaspersky.com/content/es-mx/images/repository/isc/2020/cyber-security-article.jpg",
  },
  {
    titulo: "Bases de Datos con MongoDB",
    descripcion: "Aprende a estructurar, consultar y escalar bases de datos NoSQL modernas.",
    imagen: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  },
];

export default function Home({ onLoginClick }) {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % cursos.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + cursos.length) % cursos.length);
  };

  // Mostrar 3 cursos de forma circular
  const visibleCursos = [
    cursos[index],
    cursos[(index + 1) % cursos.length],
    cursos[(index + 2) % cursos.length],
  ];

  return (
    <div>
      {/* ===== SECCIÓN HERO PRINCIPAL ===== */}
      <section className="home-container" id="inicio">
        <nav className="navbar">
          <div className="logo-section">
            <img src={logo} alt="Logo Cygnus" className="logo-img" />
            <span className="logo-text">CYGNUS</span>
          </div>

          <ul className="nav-links">
            <li><a href="#inicio" className="active">Inicio</a></li>
            <li><a href="#cursos">Cursos</a></li>
            <li><a href="#nosotros">Sobre nosotros</a></li>
          </ul>

          <button className="btn-login" onClick={onLoginClick}>
            Iniciar Sesión
          </button>
        </nav>

        <div className="hero">
          <div className="hero-text">
            <h1>Aprendizaje adaptativo a tu medida.</h1>
            <p>
              Cygnus ajusta los contenidos según tu forma de aprender, potenciando tu autonomía y tus resultados.
            </p>
            <button className="btn-primary">Comenzar ahora</button>
          </div>

          <div className="hero-image">
            <img src={cube} alt="Cubo Cygnus" />
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN DE BUSCADOR ===== */}
      <section className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar cursos, temas o categorías..."
          />
          <button>Buscar</button>
        </div>
        <br />
        <h2>Últimos aprendizajes agregados</h2>

        {/* ===== CARRUSEL ===== */}
        <div className="carousel-container">
          <button className="carousel-btn left" onClick={prevSlide}>❮</button>
          <div className="carousel">
            {visibleCursos.map((curso, i) => (
              <div key={i} className="course-card">
                <img src={curso.imagen} alt={curso.titulo} />
                <div className="course-info">
                  <h3>{curso.titulo}</h3>
                  <p>{curso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-btn right" onClick={nextSlide}>❯</button>
        </div>
      </section>
    </div>
  );
}
