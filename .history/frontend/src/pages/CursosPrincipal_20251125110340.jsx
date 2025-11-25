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


  useEffect(() => {
    // Obtener TODOS los cursos
    fetch("/api/cursos")
      .then((res) => res.json())
      .then((data) => setCursos(data))
      .catch((err) => console.error("❌ Error cargando cursos:", err));

    // Obtener los 3 últimos
    fetch("/api/cursos/ultimos")
      .then((res) => res.json())
      .then((data) => setUltimosCursos(data.cursos))
      .catch((err) => console.error("❌ Error cargando últimos cursos:", err));
  }, []);

  const [contador, setContador] = useState(0);
  const animado = useRef(false);

  useEffect(() => {
  if (cursos.length === 0) return; // Solo cuando ya llegaron los cursos

  let inicio = 0;
  const fin = cursos.length;
  const duracion = 2000;
  const pasos = 100;
  const incremento = fin / pasos;
  let paso = 0;

  const animar = setInterval(() => {
    paso++;
    inicio += incremento;

    if (paso >= pasos) {
      clearInterval(animar);
      inicio = fin;
    }

    setContador(Math.floor(inicio));
  }, duracion / pasos);

  return () => clearInterval(animar);
}, [cursos]);


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


  const niveles = ["Todos", "Básico", "Intermedio", "Avanzado"];

  const cursosFiltrados =
    categoriaFiltro === "Todos"
      ? cursos
      : cursos.filter((c) => c.nivel === categoriaFiltro);

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
        <h2 className="titulo-seccion">Explora por nivel</h2>

        <div className="filtro-categorias">
          {niveles.map((nivel) => (
            <button
              key={nivel}
              className={`btn-categoria ${categoriaFiltro === nivel ? "activo" : ""}`}
              onClick={() => setCategoriaFiltro(nivel)}
            >
              {nivel}
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
