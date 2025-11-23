import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./Perfil.css";

function Perfil({ usuario, onLogout, onNavigate }) {
  const [usuarioActual, setUsuarioActual] = useState(usuario);
  const [progresoSemanal, setProgresoSemanal] = useState([]);
  const [cursosConProgreso, setCursosConProgreso] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // Obtener progreso semanal
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

  // Obtener cursos con progreso real
  useEffect(() => {
    if (!usuarioActual?._id) return;

    const obtenerCursosConProgreso = async () => {
      try {
        setLoadingCursos(true);
        
        // 1. Obtener todos los cursos
        const responseCursos = await fetch("http://localhost:4000/api/cursos");
        const cursosData = await responseCursos.json();

        // 2. Para cada curso, verificar si hay progreso
        const cursosConProgresoArray = [];
        
        for (const curso of cursosData) {
          try {
            const responseProgreso = await fetch(
              `http://localhost:4000/api/progreso/curso/${usuarioActual._id}/${curso._id}`
            );
            const progresoData = await responseProgreso.json();
            
            if (progresoData.success && progresoData.progreso) {
              cursosConProgresoArray.push({
                ...curso,
                progreso: progresoData.progreso
              });
            }
          } catch (error) {
            console.error(`Error cargando progreso para curso ${curso.nombre}:`, error);
          }
        }

        setCursosConProgreso(cursosConProgresoArray);
      } catch (error) {
        console.error("Error cargando cursos:", error);
      } finally {
        setLoadingCursos(false);
      }
    };

    obtenerCursosConProgreso();
  }, [usuarioActual]);

  useEffect(() => {
    const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLS) setUsuarioActual(usuarioLS);

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

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);

  // Función para navegar al curso
  const verCurso = (curso) => {
    onNavigate("curso-vista", { curso });
  };

  const formatearDia = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${dias[fecha.getDay()]} ${fecha.getDate()}/${meses[fecha.getMonth()]}`;
  };

  const obtenerRangoSemana = () => {
    const hoy = new Date();
    const hace7 = new Date();
    hace7.setDate(hoy.getDate() - 6);
    return {
      inicio: formatearDia(hace7.toISOString().split("T")[0]),
      fin: formatearDia(hoy.toISOString().split("T")[0]),
    };
  };

  // Calcular progreso general
  const calcularProgresoGeneral = () => {
    if (cursosConProgreso.length === 0) return 0;
    
    const totalProgreso = cursosConProgreso.reduce((acc, curso) => 
      acc + curso.progreso.progresoPorcentual, 0
    );
    
    return Math.round(totalProgreso / cursosConProgreso.length);
  };

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

              <p className="perfil-email">
                <strong>Apodo:</strong> {usuarioActual?.apodo || "No definido"}
              </p>

              <p className="perfil-email">
                <strong>Correo:</strong> {usuarioActual?.correo}
              </p>
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

          {/* CURSOS EN DESARROLLO - CON DATOS REALES */}
          <section className="perfil-section">
            <h2>📚 Cursos en desarrollo</h2>
            
            {loadingCursos ? (
              <div className="cargando-cursos">
                <div className="spinner"></div>
                <p>Cargando tus cursos...</p>
              </div>
            ) : cursosConProgreso.length > 0 ? (
              <div className="cursos-grid">
                {cursosConProgreso.map((curso) => (
                  <div key={curso._id} className="curso-card" onClick={() => verCurso(curso)}>
                    <div className="curso-header">
                      <h3>{curso.nombre}</h3>
                      <span className={`nivel-badge nivel-${curso.nivel?.toLowerCase()}`}>
                        {curso.nivel}
                      </span>
                    </div>
                    
                    <p className="curso-descripcion">{curso.descripcion}</p>
                    
                    <div className="curso-meta">
                      <span className="meta-item">⏱️ {curso.horas || curso.horasEstimadas}h</span>
                      <span className="meta-item">📚 {curso.modulos?.length || 0} módulos</span>
                    </div>

                    <div className="progreso-barra">
                      <div
                        className="progreso-fill"
                        style={{ width: `${curso.progreso.progresoPorcentual}%` }}
                      ></div>
                    </div>
                    
                    <div className="progreso-info">
                      <span className="progreso-texto">
                        Progreso: {Math.round(curso.progreso.progresoPorcentual)}%
                      </span>
                      <span className="modulo-actual">
                        Módulo {curso.progreso.moduloActual + 1} de {curso.modulos?.length || 0}
                      </span>
                    </div>

                    {/* Información adicional del progreso */}
                    <div className="progreso-detalles">
                      {curso.progreso.modulosCompletados && curso.progreso.modulosCompletados.length > 0 && (
                        <div className="progreso-detalle-item">
                          <span>✅ {curso.progreso.modulosCompletados.length} módulos completados</span>
                        </div>
                      )}
                      {curso.progreso.evaluacionFinalCompletada && (
                        <div className="progreso-detalle-item completado">
                          <span>🏆 Evaluación final completada</span>
                        </div>
                      )}
                    </div>

                    <button className="btn-continuar-curso">
                      {curso.progreso.progresoPorcentual >= 100 ? '🎉 Ver Curso' : '🚀 Continuar'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-cursos">
                <div className="sin-cursos-icono">📚</div>
                <h3>Aún no tienes cursos en progreso</h3>
                <p>¡Comienza tu primer curso y empieza tu journey de aprendizaje!</p>
                <button 
                  className="btn-explorar-cursos"
                  onClick={() => onNavigate("cursosusuario")}
                >
                  🚀 Explorar Cursos
                </button>
              </div>
            )}
          </section>

          {/* GRÁFICA DE PROGRESO */}
          <section className="perfil-section grafica-card">
            <h2>📈 Progreso Semanal</h2>

            <p
              style={{
                textAlign: "center",
                marginBottom: "15px",
                color: "#e9d7ff",
              }}
            >
              {obtenerRangoSemana().inicio} - {obtenerRangoSemana().fin}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                height: "260px",
                padding: "10px 20px",
                borderLeft: "2px solid #e5d36c66",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
                  bottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  paddingLeft: "5px",
                  fontSize: "0.8rem",
                  color: "#f3cdff",
                }}
              >
                {[10, 8, 6, 4, 2, 0].map((h, i) => (
                  <span key={i}>{h}h</span>
                ))}
              </div>

              <div
                className="grafica-semanal"
                style={{ marginLeft: "30px", width: "100%" }}
              >
                {progresoSemanal.length > 0 ? (
                  progresoSemanal.map((item, i) => (
                    <div key={i} className="barra-dia">
                      <div
                        className="barra"
                        style={{
                          height: `${(item.duracion_horas || 0) * 20}px`,
                        }}
                      ></div>

                      <span className="dia-texto">
                        {formatearDia(item.fecha)}
                      </span>

                      <span className="horas-texto">
                        {(item.duracion_horas || 0).toFixed(1)}h
                      </span>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "10px",
                      color: "#ccc",
                    }}
                  >
                    No hay sesiones esta semana.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 🥇 MEDALLAS */}
          <section className="perfil-section">
            <h2>🥇 Medallas</h2>
            <p className="texto-explicacion">
              Las medallas se obtienen por puntos ⭐
            </p>

            <div className="medallas-grid">
              <div className="medalla-card">
                🥇 <h3>Medalla Dorada</h3>
                <p>Obtén 1000 puntos</p>
              </div>
              <div className="medalla-card">
                🥈 <h3>Medalla Plateada</h3>
                <p>Obtén 500 puntos</p>
              </div>
            </div>
          </section>

          {/* 🏆 TROFEOS */}
          <section className="perfil-section">
            <h2>🏆 Trofeos</h2>
            <p className="texto-explicacion">
              Los trofeos se ganan al completar cursos🎓
            </p>

            <div className="medallas-grid">
              <div className={`medalla-card ${cursosConProgreso.filter(curso => curso.progreso?.progresoPorcentual >= 100).length >= 1 ? 'trofeo-desbloqueado' : ''}`}>
                {cursosConProgreso.filter(curso => curso.progreso?.progresoPorcentual >= 100).length >= 1 ? '🏆' : '🔒'}
                <h3>Trofeo Maestro</h3>
                <p>Completa un curso</p>
                {cursosConProgreso.filter(curso => curso.progreso?.progresoPorcentual >= 100).length >= 1 ? (
                  <span className="trofeo-completado">¡Obtenido!</span>
                ) : (
                  <span className="progreso-trofeo">
                    {cursosConProgreso.filter(curso => curso.progreso?.progresoPorcentual >= 100).length}/1
                  </span>
                )}
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