import React, { useState, useRef, useEffect } from "react";
import "./CursosPrincipal.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";

export default function CursosPrincipal({ currentPage, onLoginClick, onNavigate }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [contadorEstudiantes, setContadorEstudiantes] = useState(0);
  const animadoEstudiantes = useRef(false);

  const [cursos, setCursos] = useState([]);
  const [ultimosCursos, setUltimosCursos] = useState([]);


  const cursos = [
    {
      id: 1,
      titulo: "Diseño de Interfaces Modernas",
      descripcion: "Crea interfaces atractivas, intuitivas y funcionales.",
      imagen: "https://www.hostingplus.com.co/wp-content/uploads/2021/07/businessman-using-tech-devices-and-icons-thin-line-interface.jpg",
      nivel: "Básico",
      horas: 15,
      modulos: ["Introducción a UX/UI", "Principios de diseño", "Prototipado", "Diseño responsivo"],
      categoria: "Diseño",
      fecha: "2025-02-18",
    },
    {
      id: 2,
      titulo: "Desarrollo Web con React",
      descripcion: "Construye aplicaciones web interactivas.",
      imagen: "https://jhasenstudio.com/wp-content/uploads/2024/10/desarrollo-web-scaled.jpg",
      nivel: "Intermedio",
      horas: 25,
      modulos: ["JSX y componentes", "Hooks", "Routing", "Firebase"],
      categoria: "Programación",
      fecha: "2025-03-01",
    },
    {
      id: 3,
      titulo: "Análisis de Datos",
      descripcion: "Procesa y analiza datos eficazmente.",
      imagen: "https://www.dqsconsulting.com/wp-content/uploads/2021/09/como-hacer-un-analisis-de-datos.jpg",
      nivel: "Intermedio",
      horas: 20,
      modulos: ["Excel avanzado", "Power BI", "Python", "Visualización"],
      categoria: "Datos",
      fecha: "2025-03-25",
    },
    {
      id: 4,
      titulo: "Inteligencia Artificial",
      descripcion: "Entrena modelos de IA del mundo real.",
      imagen: "https://img.computing.es/wp-content/uploads/2024/03/22155324/IA-2.jpg",
      nivel: "Avanzado",
      horas: 30,
      modulos: ["Machine Learning", "Redes neuronales", "Modelos predictivos"],
      categoria: "Tecnología",
      fecha: "2025-04-10",
    },
  ];

  const [contador, setContador] = useState(0);
  const animado = useRef(false);

  useEffect(() => {
    if (animado.current) return;
    animado.current = true;

    let inicio = 0;
    const fin = cursos.length;
    const duracion = 5000; // 8 segundos total
    const intervalo = 20; // actualiza cada 50ms (visible)
    const pasos = duracion / intervalo; // total de pasos de animación
    const incremento = fin / pasos; // cuánto aumenta cada paso real

    const animar = setInterval(() => {
      inicio += incremento;
      if (inicio >= fin) {
        inicio = fin;
        clearInterval(animar);
      }
      setContador(Math.floor(inicio)); // redondeamos para que no salgan decimales
    }, intervalo);

  }, []);

  useEffect(() => {
    if (animadoEstudiantes.current) return;

    fetch("/api/usuarios/count")
      .then(res => res.json())
      .then(data => {
        const total = data.total || 0;
        animadoEstudiantes.current = true;

        let inicio = 0;
        const duracion = 4000; // más lento
        const pasos = 100; // más suave
        const incremento = total / pasos;

        let pasoActual = 0;

        const animacion = setInterval(() => {
          pasoActual++;
          inicio += incremento;

          if (pasoActual >= pasos) {
            clearInterval(animacion);
            inicio = total;
          }

          setContadorEstudiantes(Math.floor(inicio));
        }, duracion / pasos);
      })
      .catch(err => console.error("❌ Error cargando estudiantes:", err));
  }, []);


  const categorias = ["Todos", "Diseño", "Programación", "Datos", "Tecnología"];
  const cursosFiltrados = categoriaFiltro === "Todos" ? cursos : cursos.filter((c) => c.categoria === categoriaFiltro);
  const ultimosCursos = cursos.slice(-3);

  // === DETALLE DE CURSO ===
  if (cursoSeleccionado) {
    return (
      <div className="detalle-curso">
        <button className="btn-volver" onClick={() => setCursoSeleccionado(null)}>
          ← Volver a los cursos
        </button>

        <div className="detalle-contenido">
          <img src={cursoSeleccionado.imagen} alt={cursoSeleccionado.titulo} className="detalle-imagen" />

          <div className="detalle-info">
            <h1>{cursoSeleccionado.titulo}</h1>
            <p className="detalle-descripcion">{cursoSeleccionado.descripcion}</p>

            <div className="detalle-datos">
              <p><strong>⏱ Duración:</strong> {cursoSeleccionado.horas} horas</p>
              <p><strong>📘 Nivel:</strong> {cursoSeleccionado.nivel}</p>
              <p><strong>📦 Módulos:</strong> {cursoSeleccionado.modulos.length}</p>
              <p><strong>🗓 Publicado:</strong> {cursoSeleccionado.fecha}</p>
            </div>

            <div className="detalle-linea-tiempo">
              <h3>Contenido del curso</h3>
              <ul>
                {cursoSeleccionado.modulos.map((m, i) => (
                  <li key={i}>
                    <span className="punto"></span>
                    {m}
                  </li>
                ))}
              </ul>

              <p className="detalle-nota">* Inicia sesión para acceder a los módulos.</p>

              <button className="btn-login-detalle" onClick={onLoginClick}>
                Iniciar sesión para acceder
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // === PÁGINA PRINCIPAL ===
  return (
    <div className="cursos-principal">
      <NavbarPrincipal currentPage={currentPage} onLoginClick={onLoginClick} onNavigate={onNavigate} />

      {/* HERO */}
      <section className="hero-cursosHome">
        <div className="hero-contenidHome">
          <h1>Explora nuestros cursos más recientes</h1>
          <p>Aprende a tu ritmo con contenido guiado por expertos.</p>

          {/* BOTÓN AGREGADO */}
          <button className="btn-principal" onClick={onLoginClick}>
            Comienza a aprender ahora
          </button>
        </div>
      </section>

      {/* CONTADOR CREATIVO */}
      <div className="contador-cursos">
        <div className="contador-item">
          <h3>📚 Cursos disponibles</h3>
          <span className="contador-numero">{contador}</span>
        </div>

        <div className="contador-item">
          <h3>👨‍🎓 Estudiantes aprendiendo</h3>
          <span className="contador-numero">{contadorEstudiantes}</span>
        </div>
      </div>


      {/* ÚLTIMOS CURSOS */}
      <section className="seccion-cursos">
        <h2 className="titulo-seccion">Últimos cursos agregados</h2>
        <div className="grid-cursos">
          {ultimosCursos.map((curso) => (
            <div key={curso.id} className="tarjeta-curso">
              <img src={curso.imagen} alt={curso.titulo} className="imagen-curso" />
              <div className="contenido-curso">
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
                <span className="etiqueta-nivel">Nivel {curso.nivel}</span>
                <button className="btn-detalles" onClick={() => setCursoSeleccionado(curso)}>
                  Ver más detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTRO */}
      <section className="seccion-cursos">
        <h2 className="titulo-seccion">Explora por categoría</h2>

        <div className="filtro-categorias">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`btn-categoria ${categoriaFiltro === cat ? "activo" : ""}`}
              onClick={() => setCategoriaFiltro(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid-cursos">
          {cursosFiltrados.map((curso) => (
            <div key={curso.id} className="tarjeta-curso">
              <img src={curso.imagen} alt={curso.titulo} className="imagen-curso" />
              <div className="contenido-curso">
                <h3>{curso.titulo}</h3>
                <p>{curso.descripcion}</p>
                <span className="etiqueta-nivel">Nivel {curso.nivel}</span>
                <button className="btn-detalles" onClick={() => setCursoSeleccionado(curso)}>
                  Ver más detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER MOTIVACIONAL */}
      <section className="banner-motivacional">
        <h2>✨ El conocimiento es tu mejor herramienta.</h2>
        <p>Únete a miles de estudiantes que ya están construyendo su futuro.</p>
        <button className="btn-principal" onClick={onLoginClick}>
          Crear cuenta gratis
        </button>
      </section>

      <Footer />
    </div>
  );
}
