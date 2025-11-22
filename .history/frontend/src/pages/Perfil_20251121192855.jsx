import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./Perfil.css";

function Perfil({ usuario, onLogout, onNavigate }) {
  const [usuarioActual, setUsuarioActual] = useState(usuario);

  const [progresoSemanal, setProgresoSemanal] = useState([]);

  useEffect(() => {
    if (!usuarioActual?._id) return;

    const obtenerProgreso = async () => {
      try {
        const resp = await fetch(
          `http://localhost:4000/api/sesiones/semana/${usuarioActual._id}`
        );
        const data = await resp.json();

        if (data.success) {
          setProgresoSemanal(data.progresoSemanal);
        }
      } catch (error) {
        console.error("Error obteniendo progreso semanal:", error);
      }
    };

    obtenerProgreso();
  }, [usuarioActual]);

  useEffect(() => {
    // Actualizar estado si cambia el usuario en localStorage
    const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLS) setUsuarioActual(usuarioLS);

    // Aplicar fondo desde la DB al body
    const fondoUsuario = usuarioLS?.fondo;
    if (fondoUsuario) {
      document.body.style.backgroundImage = `url(${fondoUsuario})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.transition = "background 0.5s ease";
    } else {
      document.body.style.backgroundImage = "";
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  const nombreUsuario =
    usuarioActual?.apodo || usuarioActual?.nombre_completo || "Usuario";


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

  return (
    <>
      <NavbarPrincipal
        usuario={usuarioActual}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="perfil"
      />

      <div className="perfil-container">
        <div className="perfil-card">
          {/* HEADER PERFIL */}
          <div className="perfil-header">
            <div className="perfil-avatar">
              <img
                src={
                  usuarioActual?.avatar ||
                  "https://cdn-icons-png.flaticon.com/128/4712/4712108.png"
                }
                alt="Avatar"
              />
            </div>

            <div className="perfil-info">
              <h1>{usuarioActual?.nombre_completo}</h1>
              <p className="perfil-email">{usuarioActual?.correo}</p>
              <p className="perfil-progreso">Progreso general: 80%</p>
            </div>

            <div className="perfil-actions">
              <button
                className="btn-modificar"
                onClick={() => onNavigate("modificarPerfil")}
              >
                ✏️ Modificar perfil
              </button>
            </div>
          </div>

          {/* CURSOS EN DESARROLLO */}
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
                  <span className="progreso-texto">
                    Progreso: {curso.progreso}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* GRÁFICA DE PROGRESO */}
          <section className="perfil-section grafica-card">
            <h2>📈 Progreso Semanal</h2>

            <div className="grafica-semanal">
              {progresoSemanal.length > 0 ? (
                progresoSemanal.map((item, i) => (
                  <div key={i} className="barra-dia">
                    <div
                      className="barra"
                      style={{ height: `${item.duracion_horas * 20}px` }}
                    ></div>

                    <span className="dia-texto">
                      {item.fecha.slice(5)} {/* muestra MM-DD */}
                    </span>

                    <span className="horas-texto">{item.duracion_horas}h</span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", marginTop: "10px", color: "#888" }}>
                  No hay sesiones registradas esta semana.
                </p>
              )}
            </div>
          </section>

          {/* MEDALLAS Y TROFEOS */}
          <section className="perfil-section">
            <h2>🏅 Medallas y Trofeos</h2>
            <p className="texto-explicacion">
              Las <strong>medallas</strong> se obtienen por puntos ⭐ y los{" "}
              <strong>trofeos</strong> se ganan al completar cursos 🏆
            </p>
            <div className="medallas-grid">
              <div className="medalla-card">
                🥇
                <h3>Medalla Dorada</h3>
                <p>Obtén 1,000 puntos</p>
              </div>
              <div className="medalla-card">
                🥈
                <h3>Medalla Plateada</h3>
                <p>Obtén 500 puntos</p>
              </div>
              <div className="medalla-card">
                🏆
                <h3>Trofeo Maestro</h3>
                <p>Completa un curso completo</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Perfil;
