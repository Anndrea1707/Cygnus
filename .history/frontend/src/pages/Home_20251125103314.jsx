import React, { useState, useEffect } from 'react';
import './Home.css';
import cube from '../imagenes/CuboPrincipal.png';
import logo from '../imagenes/logo.png';
import NavbarPrincipal from '../components/NavbarPrincipal';
import Footer from '../components/Footer';


const [cursos, setCursos] = useState([]);
const [cursosFiltrados, setCursosFiltrados] = useState([]);


export default function Home({ currentPage, onLoginClick, onNavigate }) {
  const [index, setIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showScroll, setShowScroll] = useState(false);

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

  // === Lógica carrusel automático de testimonios ===
  const testimonios = [
    {
      nombre: "Laura González",
      texto:
        "Cygnus me ayudó a aprender a mi propio ritmo. Siento que por fin tengo una plataforma que se adapta a mí y no al revés.",
      foto: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    },
    {
      nombre: "Andrés Ramírez",
      texto:
        "Los cursos son dinámicos y los recordatorios me mantienen enfocado. He mejorado muchísimo en poco tiempo.",
      foto: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.1.0&fm=jpg&q=60&w=3000",
    },
    {
      nombre: "Camila Torres",
      texto:
        "El sistema adaptativo de Cygnus es impresionante. Se nota que realmente entiende mis avances y me reta cuando es necesario.",
      foto: "https://i.pinimg.com/1200x/b0/4b/14/b04b142f608f52c511720a04999e92f0.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonios.length);
    }, 30000); // cambia cada 30 segundos
    return () => clearInterval(interval);
  }, [testimonios.length]);

  // === Mostrar u ocultar botón "volver arriba" ===
  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/cursos/ultimos");
        const data = await response.json();

        if (data.ok) {
          setCursos(data.cursos);
          setCursosFiltrados(data.cursos);
        }
      } catch (error) {
        console.error("Error cargando cursos:", error);
      }
    };

    cargarCursos();
  }, []);


  return (
    <div>
      {/* ===== SECCIÓN HERO PRINCIPAL ===== */}
      <section className="home-container" id="inicio">
        <NavbarPrincipal
          currentPage={currentPage}
          onLoginClick={onLoginClick}
          onNavigate={onNavigate}
        />
        <div className="hero">
          <div className="hero-text">
            <h1>Aprendizaje adaptativo a tu medida.</h1>
            <p>
              Cygnus ajusta los contenidos según tu forma de aprender, potenciando tu autonomía y tus resultados.
            </p>
            <button className="btn-primaryHome">Comenzar ahora</button>
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
            onChange={(e) => {
              const texto = e.target.value.toLowerCase();
              const filtrados = cursos.filter(curso =>
                curso.titulo.toLowerCase().includes(texto) ||
                curso.descripcion.toLowerCase().includes(texto)
              );
              setCursosFiltrados(filtrados);
            }}
          />

          <button>Buscar</button>
        </div>
        <br />
        <h2>Últimos aprendizajes agregados</h2>

        {/* ===== CARRUSEL ===== */}
        <div className="carousel-container">
          <div className="carousel">
            {cursosFiltrados.slice(0, 3).map((curso, i) => (
              <div key={i} className="course-card">
                <img src={curso.imagen} alt={curso.titulo} />
                <div className="course-info">
                  <h3>{curso.titulo}</h3>
                  <p>{curso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
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
            <img src="https://cdn-icons-png.flaticon.com/128/2586/2586656.png" alt="Aprendizaje adaptativo" className="feature-icon" />
            <h3>Aprendizaje Adaptativo</h3>
            <p>Cygnus ajusta el contenido a tu ritmo y nivel, garantizando que siempre avances.</p>
          </div>

          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/128/1792/1792929.png" alt="Recordatorios" className="feature-icon" />
            <h3>Recordatorios Inteligentes</h3>
            <p>Repite los temas justo cuando estás a punto de olvidarlos, gracias al modelo de la curva del olvido.</p>
          </div>

          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/128/1067/1067357.png" alt="Progreso" className="feature-icon" />
            <h3>Progreso Medible</h3>
            <p>Visualiza tu crecimiento con estadísticas y gráficos de rendimiento en tiempo real.</p>
          </div>

          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/128/3100/3100357.png" alt="Comunidad" className="feature-icon" />
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

      {/* ===== SECCIÓN DE TESTIMONIOS ===== */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros usuarios</h2>
        <div className="testimonial-carousel">
          {testimonios.map((t, i) => (
            <div
              key={i}
              className={`testimonial ${i === testimonialIndex ? 'active' : 'hidden'}`}
            >
              <img src={t.foto} alt={t.nombre} className="testimonial-avatar" />
              <h3>{t.nombre}</h3>
              <p>“{t.texto}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTÓN VOLVER ARRIBA ===== */}
      <button
        className={`scroll-top-btn ${showScroll ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/7709/7709175.png"
          alt="Volver arriba"
          className="scroll-icon"
        />
      </button>


      {/* ===== FOOTER / FRONTING ===== */}
      <Footer />
    </div>
  );
}
