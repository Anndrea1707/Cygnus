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
      {/* ===== SECCIÓN DE VENTAJAS ===== */}
      <section className="features-section">
        <h2>¿Por qué aprender con Cygnus?</h2>
        <p className="features-subtitle">
          Cygnus combina tecnología y pedagogía para ofrecerte una experiencia de aprendizaje única.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Aprendizaje Adaptativo</h3>
            <p>Cygnus ajusta el contenido a tu ritmo y nivel, garantizando que siempre avances.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💡</span>
            <h3>Recordatorios Inteligentes</h3>
            <p>Repite los temas justo cuando estás a punto de olvidarlos, gracias al modelo de la curva del olvido.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <h3>Progreso Medible</h3>
            <p>Visualiza tu crecimiento con estadísticas y gráficos de rendimiento en tiempo real.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Comunidad Activa</h3>
            <p>Aprende junto a otros usuarios, comparte retos y forma parte de una red de aprendizaje colaborativo.</p>
          </div>
        </div>
        <div className="features-button">
          <button className="btn-start">Comenzar ahora</button>
        </div>
      </section>
      {/* ===== SECCIÓN DE RETOS Y LOGROS ===== */}
      <section className="achievements-section" id="retos">
        <div className="achievements-content">
          <div className="achievements-header">
            <i className="fas fa-rocket achievements-icon"></i>
            <h2>Retos y Logros</h2>
            <p>
              Gana medallas por cada clase completada y copas por finalizar cursos.
              ¡Súmate al desafío y alcanza la cima del conocimiento!
            </p>
          </div>

          <div className="achievements-grid">
            <div className="achievement-card">
              <img src="https://cdn-icons-png.flaticon.com/128/10393/10393612.png" alt="Medalla Bronce" />
              <h3>Medalla de Bronce</h3>
              <p>Otorgada al completar clases básicas. ¡Todo comienzo cuenta!</p>
            </div>

            <div className="achievement-card">
              <img src="https://cdn-icons-png.flaticon.com/128/10393/10393610.png" alt="Medalla Plata" />
              <h3>Medalla de Plata</h3>
              <p>Logra clases de nivel intermedio. ¡Tu progreso se nota!</p>
            </div>

            <div className="achievement-card">
              <img src="https://cdn-icons-png.flaticon.com/128/10393/10393609.png" alt="Medalla Oro" />
              <h3>Medalla de Oro</h3>
              <p>Completa clases avanzadas y demuestra tu maestría.</p>
            </div>

            <div className="achievement-card special">
              <img src="https://cdn-icons-png.flaticon.com/128/11173/11173370.png" alt="Copa del Saber" />
              <h3>Copa del Saber</h3>
              <p>Premio especial por finalizar un curso completo con éxito. 🏆</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
