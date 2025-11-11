import React, { useState } from "react";
import "./CursosPrincipal.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";

export default function CursosPrincipal({ currentPage, onLoginClick, onNavigate }) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  const cursos = [
    {
      id: 1,
      titulo: "Diseño de Interfaces Modernas",
      descripcion: "Crea interfaces atractivas, intuitivas y funcionales que conecten con tus usuarios.",
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
      descripcion: "Construye aplicaciones web interactivas con React, una de las librerías más potentes del mundo.",
      imagen: "https://jhasenstudio.com/wp-content/uploads/2024/10/desarrollo-web-scaled.jpg",
      nivel: "Intermedio",
      horas: 25,
      modulos: ["JSX y componentes", "Hooks", "Routing", "Firebase y despliegue"],
      categoria: "Programación",
      fecha: "2025-03-01",
    },
    {
      id: 3,
      titulo: "Análisis de Datos",
      descripcion: "Domina las herramientas esenciales para procesar y analizar datos de forma eficiente.",
      imagen: "https://www.dqsconsulting.com/wp-content/uploads/2021/09/como-hacer-un-analisis-de-datos.jpg",
      nivel: "Intermedio",
      horas: 20,
      modulos: ["Excel avanzado", "Power BI", "Python para análisis", "Visualización de datos"],
      categoria: "Datos",
      fecha: "2025-03-25",
    },
    {
      id: 4,
      titulo: "Inteligencia Artificial",
      descripcion: "Aprende cómo entrenar modelos de IA y aplicarlos a problemas del mundo real.",
      imagen: "https://img.computing.es/wp-content/uploads/2024/03/22155324/IA-2.jpg",
      nivel: "Avanzado",
      horas: 30,
      modulos: ["Machine Learning básico", "Redes neuronales", "Modelos predictivos"],
      categoria: "Tecnología",
      fecha: "2025-04-10",
    },
  ];

  // === Filtrar por categoría ===
  const categorias = ["Todos", "Diseño", "Programación", "Datos", "Tecnología"];
  const cursosFiltrados =
    categoriaFiltro === "Todos"
      ? cursos
      : cursos.filter((c) => c.categoria === categoriaFiltro);

  // === Últimos 3 cursos ===
  const ultimosCursos = cursos.slice(-3);

  // === VISTA DETALLE ===
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
              <button
                className="btn-login-detalle"
                onClick={onLoginClick}
              >
                Inicia sesión para acceder al curso
              </button>

            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // === VISTA PRINCIPAL ===
  return (
    <div className="cursos-principal">
      <NavbarPrincipal currentPage={currentPage} onLoginClick={onLoginClick} onNavigate={onNavigate} />

      {/* HERO */}
      <section className="hero-cursos">
        <div className="hero-contenido">
          <h1>Explora nuestros cursos más recientes</h1>
          <p>Aprende a tu ritmo con contenido actualizado y guiado por expertos.</p>
        </div>
      </section>

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

      {/* FILTRO DE CATEGORÍAS */}
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

      <Footer />
    </div>
  );
}
