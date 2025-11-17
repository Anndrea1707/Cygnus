import React from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import "./Perfil.css";

 function Perfil({ usuario, onLogout, onNavigate }) {
  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";
  const cursosEnDesarrollo = [
    {
      nombre: "Curso React Avanzado",
      descripcion: "Aprende componentes, hooks y state management.",
      progreso: 65,
    },
    {
      nombre: "JavaScript Moderno",
      descripcion: "ES6+, async/await, promesas y más.",
      progreso: 80,
    },
  ];

  const comentarios = [
    {
      autor: "María Gómez",
      texto: "¡Tu progreso es impresionante! Sigue así 😊",
    },
    {
      autor: "Carlos Ruiz",
      texto: "Muy buen trabajo en el curso de React. ¡Felicidades!",
    },
  ];

  return (
    <>
      {/* === NAVBAR PRINCIPAL === */}
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="perfil"
      />

      {/* === CONTENEDOR PERFIL (TARJETA CENTRADA) === */}
      <div className="perfil-container">
        <div className="perfil-card">
          {/* === ENCABEZADO PERFIL === */}
          <div className="perfil-header">
            <div className="perfil-avatar">
              <img
                src="https://cdn-icons-png.flaticon.com/128/4712/4712108.png"
                alt="Avatar"
              />
            </div>

            <div className="perfil-info">
              <h1>{usuario?.nombre_completo || "Usuario Desconocido"}</h1>
              <p className="perfil-email">{usuario?.email}</p>
              <p className="perfil-progreso">Progreso general: 80%</p>
            </div>

            <div className="perfil-actions">
              <div className="perfil-nivel">
                <span className="nivel-texto">Nivel</span>
                <span className="nivel-numero">4</span>
              </div>
              <button
                className="btn-modificar"
                onClick={() => onNavigate("/editar-perfil")}
              >
                ✏️ Modificar perfil
              </button>
            </div>
          </div>

          {/* === CURSOS EN DESARROLLO === */}
          <section className="perfil-section">
            <h2>📚 Cursos en desarrollo</h2>
            <div className="cursos-grid">
              {cursosEnDesarrollo.map((curso, i) => (
                <div key={i} className="curso-card">
                  <h3>{curso.nombre}</h3>
                  <p>{curso.descripcion}</p>
                  <div className="progreso-barra">
                    <div
                      className="progreso-fill"
                      style={{ width: `${curso.progreso}%` }}
                    ></div>
                  </div>
                  <span className="progreso-texto">Progreso: {curso.progreso}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* === MEDALLAS === */}
          <section className="perfil-section">
            <h2>🏅 Logros y Medallas</h2>
            <div className="medallas-grid">
              <div className="medalla-card">
                🥇
                <h3>Primer Curso</h3>
                <p>Completaste tu primer curso</p>
              </div>
              <div className="medalla-card">
                🔥
                <h3>Aprendiz Constante</h3>
                <p>5 días seguidos de estudio</p>
              </div>
              <div className="medalla-card">
                🎓
                <h3>Maestro del Tema</h3>
                <p>Aprobaste todos los módulos</p>
              </div>
            </div>
          </section>

          {/* === COMENTARIOS (solo si hay) === */}
          {comentarios.length > 0 && (
            <section className="perfil-section">
              <h2>💬 Comentarios</h2>
              {comentarios.map((c, i) => (
                <div key={i} className="comentario">
                  <strong>{c.autor}:</strong> <p>{c.texto}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
export default Perfil;