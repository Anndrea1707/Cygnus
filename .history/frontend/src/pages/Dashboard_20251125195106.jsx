import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import SoportePanel from "../components/SoportePanel";
import { recomendarCursos } from "../helpers/recomendaciones";

function Dashboard({ usuario, onLogout, onNavigate }) {
  const [mostrarSoporte, setMostrarSoporte] = useState(false);
  const [cursosConProgreso, setCursosConProgreso] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState(null);

  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";

  useEffect(() => {
    if (!usuario) return;
    if (!usuario.encuesta_inicial?.completada) {
      onNavigate("encuesta-inicial");
      return;
    }
    if (!usuario.prueba_conocimiento?.completada) {
      onNavigate("prueba-diagnostica");
      return;
    }
  }, [usuario, onNavigate]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?._id || !usuario.prueba_conocimiento?.completada) return;
      try {
        setLoading(true);
        const respCursos = await fetch("https://cygnus-xjo4.onrender.com/api/cursos");
        const cursosData = await respCursos.json();
        setTodosLosCursos(cursosData);

        const rec = recomendarCursos(cursosData, usuario);
        setRecomendaciones(rec);

        const progresoArray = [];
        const completadosArray = [];

        await Promise.all(
          (cursosData || []).map(async (curso) => {
            try {
              const respProg = await fetch(`https://cygnus-xjo4.onrender.com/api/progreso/curso/${usuario._id}/${curso._id}`);

              const progData = await respProg.json();
              if (progData?.success && progData.progreso) {
                const pct = Number(progData.progreso.progresoPorcentual || 0);
                if (pct >= 100) {
                  completadosArray.push({ ...curso, progreso: progData.progreso });
                } else {
                  progresoArray.push({ ...curso, progreso: progData.progreso });
                }
              }
            } catch (err) {
              console.error(`Error progreso curso ${curso._id}:`, err);
            }
          })
        );

        setCursosConProgreso(progresoArray);
        setCursosCompletados(completadosArray);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  const verCurso = (curso) => onNavigate("curso-vista", { curso });
  const continuarCurso = (curso) => onNavigate("curso-vista", { curso });
  const verTodosLosCursos = () => onNavigate("cursosusuario");

  const totalConProgreso = cursosConProgreso.length + cursosCompletados.length;
  const countCompletados = cursosCompletados.length;
  const promedioProgreso = Math.round(
    ([...cursosConProgreso, ...cursosCompletados].reduce(
      (acc, c) => acc + Number(c.progreso?.progresoPorcentual || 0),
      0
    ) / Math.max(totalConProgreso, 1)) || 0
  );

  const TarjetaCompacta = ({ curso, tipo = "recomendado" }) => {
    const progresoPct = Number(curso?.progreso?.progresoPorcentual || 0);
    const evaluacionFinalCompletada = curso?.progreso?.evaluacionFinalCompletada;
    const notaEvaluacionFinal = curso?.progreso?.notaEvaluacionFinal || 0;
    const evaluacionAprobada = notaEvaluacionFinal >= 70;

    return (
      <article className="tarjeta-compacta" aria-label={curso.nombre}>
        <div className="compacta-imagen">
          <img src={curso.imagen} alt={curso.nombre} />
          {tipo !== "recomendado" && (
            <span className={`compacta-badge ${progresoPct >= 100 ? "completado" : ""}`}>
              {Math.round(progresoPct)}%
            </span>
          )}
        </div>

        <div className="compacta-body">
          <h3 className="compacta-titulo">{curso.nombre}</h3>
          <p className="compacta-descripcion descripcion-cortada">{curso.descripcion}</p>
          <div className="compacta-info">
            <span className="tag-nivel">{curso.nivel}</span>
            <span className="tag-modulos">{curso.modulos?.length || 0} módulos</span>
          </div>

          {tipo === "progreso" && (
            <>
              <div className="compacta-progreso">
                <div className="compacta-progressbar" aria-hidden>
                  <div
                    className="compacta-fill"
                    style={{ width: `${Math.max(0, Math.min(100, progresoPct))}%` }}
                  />
                </div>
                <div className="compacta-progresstext">{Math.round(progresoPct)}% completado</div>
              </div>

              <div className="compacta-detalles">
                <div>
                  <span className="det-label">Módulo actual:</span>{" "}
                  <span className="det-val">
                    {Number(curso.progreso?.moduloActual ?? 0) + 1} de {curso.modulos?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="det-label">Completados:</span>{" "}
                  <span className="det-val">{curso.progreso?.modulosCompletados?.length || 0}</span>
                </div>
              </div>

              {/* ✅ CORREGIDO: Mostrar estado real de la evaluación final */}
              {evaluacionFinalCompletada && (
                <div className={`compacta-eval ${evaluacionAprobada ? 'aprobada' : 'reprobada'}`}>
                  {evaluacionAprobada ? '✅ Evaluación final aprobada' : '❌ Evaluación final reprobada'}
                </div>
              )}
            </>
          )}

          <button
            className="btn-accion"
            onClick={() => (tipo === "progreso" ? continuarCurso(curso) : verCurso(curso))}
          >
            {tipo === "completado" ? "📘 Ver Curso" : tipo === "progreso" ? "🚀 Continuar Curso" : "🚀 Ver Curso"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="dashboard-background">
      <NavbarPrincipal usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} currentPage="dashboard" />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="titulo-principal">Tu progreso</h1>
          <p className="subtitulo-principal">
            Bienvenido, <strong>{nombreUsuario}</strong>. Aquí tienes un resumen rápido de tu avance y recomendaciones.
          </p>
        </header>

        {/* PROGRESO GENERAL */}
        <section className="progreso-general" aria-label="Tu progreso general">
          <div className="pg-card">
            <div className="pg-icon">📚</div>
            <div className="pg-info">
              <div className="pg-number">{totalConProgreso}</div>
              <div className="pg-label">Cursos con progreso</div>
            </div>
          </div>

          <div className="pg-card">
            <div className="pg-icon">✅</div>
            <div className="pg-info">
              <div className="pg-number">{countCompletados}</div>
              <div className="pg-label">Cursos completados</div>
            </div>
          </div>

          <div className="pg-card">
            <div className="pg-icon">🎯</div>
            <div className="pg-info">
              <div className="pg-number">{promedioProgreso}%</div>
              <div className="pg-label">Progreso promedio</div>
            </div>
          </div>
        </section>

        {/* RECOMENDADOS */}
        {recomendaciones && (
          <section className="seccion-recomendados" aria-label="Recomendación personalizada">
            <div className="section-header">
              <h2>Recomendación Personalizada</h2>
              <p className="small">
                <span className="habilidad-destacada">
                  Tu habilidad es: {Number(recomendaciones.habilidadActual).toFixed(1)}
                </span>
                <br />
                <span className="nivel-recomendado">
                  Nivel recomendado: <strong>{recomendaciones.nivelRecomendado}</strong>
                </span>
              </p>
              <p className="descripcion-recomendacion">
                En base a tu habilidad se asignará un nivel recomendado, el cual se usará para sugerirte cursos apropiados.
              </p>
            </div>

            {recomendaciones.cursosRecomendados?.length > 0 ? (
              <div className="grid-tarjetas">
                {recomendaciones.cursosRecomendados.map((curso) => (
                  <TarjetaCompacta key={curso._id} curso={curso} tipo="recomendado" />
                ))}
              </div>
            ) : (
              <p className="info-vacio">No encontramos cursos compatibles con tu habilidad actual.</p>
            )}
          </section>
        )}

        {/* EN PROGRESO */}
        <section className="seccion-progreso" aria-label="Cursos en progreso">
          <div className="section-header">
            <h2>📚 Tus Cursos en Progreso</h2>
            <p className="small">Aquí verás los cursos que has dejado incompletos y puedes continuar.</p>
          </div>

          {loading ? (
            <div className="cargando-cursos">
              <div className="spinner" />
              <p>Cargando tus cursos...</p>
            </div>
          ) : cursosConProgreso.length > 0 ? (
            <div className="grid-tarjetas">
              {cursosConProgreso.map((curso) => (
                <TarjetaCompacta key={curso._id} curso={curso} tipo="progreso" />
              ))}
            </div>
          ) : (
            <div className="sin-cursos-progreso">
              <div className="sin-cursos-icono">📚</div>
              <h4>Aún no tienes cursos en progreso</h4>
              <p>¡Comienza tu primer curso y empieza tu journey de aprendizaje!</p>
            </div>
          )}
        </section>

        {/* COMPLETADOS */}
        <section className="seccion-completados" aria-label="Cursos completados">
          <div className="section-header">
            <h2>🎉 Cursos Completados</h2>
            <p className="small">Excelente trabajo, has logrado completar varios cursos.</p>
          </div>

          {cursosCompletados.length > 0 ? (
            <div className="grid-tarjetas">
              {cursosCompletados.map((curso) => (
                <TarjetaCompacta key={curso._id} curso={curso} tipo="completado" />
              ))}
            </div>
          ) : (
            <p className="info-vacio">Aún no has completado cursos.</p>
          )}
        </section>

        <div className="ver-todos-cursos final">
          <button className="btn-ver-todos" onClick={verTodosLosCursos}>
            📖 Ver Todos los Cursos Disponibles
          </button>
        </div>
      </main>

      <button className="btn-ayuda-flotante" onClick={() => setMostrarSoporte(true)}>
        <img src="https://cdn-icons-png.flaticon.com/128/5726/5726775.png" alt="soporte" />
      </button>

      {mostrarSoporte && <SoportePanel onClose={() => setMostrarSoporte(false)} usuario={usuario} />}

      <Footer />
    </div>
  );
}

export default Dashboard;
