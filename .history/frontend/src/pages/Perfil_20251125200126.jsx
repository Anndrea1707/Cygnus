import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./Perfil.css";

function Perfil({ usuario, onLogout, onNavigate }) {
  const [usuarioActual, setUsuarioActual] = useState(usuario);
  const [progresoSemanal, setProgresoSemanal] = useState([]);
  const [cursosConProgreso, setCursosConProgreso] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // ----- Parseo de fecha local seguro (evita cambios por UTC) -----
  const parseFechaLocal = (fechaStr) => {
    // fechaStr esperado en formato "YYYY-MM-DD" o ISO parcial.
    if (!fechaStr) return null;
    const partes = fechaStr.split("T")[0].split("-");
    if (partes.length === 3) {
      const [y, m, d] = partes.map(Number);
      // new Date(year, monthIndex, day) crea la fecha en zona local a las 00:00 local
      return new Date(y, m - 1, d);
    }
    // fallback a Date normal si formato distinto
    const fallback = new Date(fechaStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  // Formateo legible corto
  const formatearDia = (fechaStr) => {
    const fecha = parseFechaLocal(fechaStr);
    if (!fecha) return "";

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

  // Obtener rango semana (inicio y fin)
  const obtenerRangoSemana = () => {
    const hoy = new Date();
    // usar hora local; restamos 6 días para cubrir 7 días incluyendo hoy
    const hace6 = new Date(hoy);
    hace6.setDate(hoy.getDate() - 6);

    // convertimos a formatos "YYYY-MM-DD" para parseo local, usando getFullYear/... etc
    const toYYYYMMDD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    return {
      inicio: formatearDia(toYYYYMMDD(hace6)),
      fin: formatearDia(toYYYYMMDD(hoy)),
    };
  };

  // Obtener progreso semanal
  useEffect(() => {
    if (!usuarioActual?._id) return;

    const obtenerProgreso = async () => {
      try {
        const resp = await fetch(`https://cygnus-xjo4.onrender.com/api/sesiones/semana/${usuarioActual._id}`);

        const data = await resp.json();

        if (data.success) {
          // Asegurar que las fechas vengan en formato esperado y ordenar por fecha
          const arreglo = Array.isArray(data.progresoSemanal) ? data.progresoSemanal : [];
          // normalizar: cada item debe tener { fecha: 'YYYY-MM-DD', duracion_horas: number }
          const normalizado = arreglo.map((it) => ({
            fecha: it.fecha?.split("T")[0] || it.fecha,
            duracion_horas: Number(it.duracion_horas || it.duracion || 0),
          }));
          // ordenar asc por fecha
          normalizado.sort((a, b) => (a.fecha > b.fecha ? 1 : a.fecha < b.fecha ? -1 : 0));
          setProgresoSemanal(normalizado);
        } else {
          setProgresoSemanal([]);
        }
      } catch (error) {
        console.error("Error obteniendo progreso semanal:", error);
        setProgresoSemanal([]);
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
        const responseCursos = await fetch("https://cygnus-xjo4.onrender.com/api/cursos");
        const cursosData = await responseCursos.json();

        // 2. Para cada curso, verificar si hay progreso
        const cursosConProgresoArray = [];

        for (const curso of cursosData) {
          try {
            const responseProgreso = await fetch(`https://cygnus-xjo4.onrender.com/api/progreso/curso/${usuarioActual._id}/${curso._id}`);

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
        setCursosConProgreso([]);
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

  // Calcular progreso general (promedio simple)
  const calcularProgresoGeneral = () => {
    if (cursosConProgreso.length === 0) return 0;

    const totalProgreso = cursosConProgreso.reduce((acc, curso) =>
      acc + (curso.progreso?.progresoPorcentual || 0), 0
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

              <p className="perfil-progreso">
                Progreso promedio: {calcularProgresoGeneral()}%
              </p>
            </div>

            <div className="perfil-actions">
              <div className="perfil-nivel">
                <span className="nivel-numero">
                  {usuarioActual?.habilidad_nueva || "—"}
                </span>
                <span>Tu habilidad</span>
              </div>

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
                {cursosConProgreso.map((curso) => {
                  const porcentaje = Math.round(curso.progreso?.progresoPorcentual || 0);
                  return (
                    <div key={curso._id} className="curso-card" onClick={() => verCurso(curso)}>
                      {/* IMAGEN DEL CURSO (arriba) */}
                      <div className="curso-imagen-wrapper">
                        <img
                          className="curso-imagen"
                          src={curso.imagen || "https://via.placeholder.com/600x300?text=Curso"}
                          alt={curso.nombre}
                          loading="lazy"
                        />
                        <div className="curso-nivel-badge">
                          <span className="curso-nivel-text">{curso.nivel || "Nivel"}</span>
                        </div>
                      </div>

                      <div className="curso-body">
                        <h3 className="curso-titulo">{curso.nombre}</h3>
                        <p className="curso-descripcion">{curso.descripcion}</p>

                        <div className="curso-meta">
                          <span className="meta-item">⏱️ {curso.horas || curso.horasEstimadas || 0}h</span>
                          <span className="meta-item">📚 {curso.modulos?.length || 0} módulos</span>
                        </div>

                        <div className="perfil-progreso-barra" aria-hidden>
                          <div
                            className="perfil-progreso-fill"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>

                        <div className="perfil-progreso-info">
                          <span className="perfil-progreso-texto">
                            Progreso: {porcentaje}%
                          </span>
                          <span className="modulo-actual">
                            Módulo {(curso.progreso?.moduloActual || 0) + 1} de {curso.modulos?.length || 0}
                          </span>
                        </div>

                        <div className="progreso-detalles">
                          {curso.progreso?.modulosCompletados && curso.progreso.modulosCompletados.length > 0 && (
                            <div className="progreso-detalle-item">
                              <span>✅ {curso.progreso.modulosCompletados.length} módulos completados</span>
                            </div>
                          )}
                          {curso.progreso?.evaluacionFinalCompletada && (
                            <div className="progreso-detalle-item completado">
                              <span>🏆 Evaluación final completada</span>
                            </div>
                          )}
                        </div>

                        <button
                          className="btn-continuar-curso"
                          onClick={(e) => { e.stopPropagation(); verCurso(curso); }}
                        >
                          {porcentaje >= 100 ? '🎉 Ver Curso' : '🚀 Continuar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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

          {/* GRÁFICA DE PROGRESO (REESCRITA Y CORREGIDA) */}
          <section className="perfil-section grafica-card">
            <h2>📈 Progreso Semanal</h2>

            <p className="grafica-rango">
              {obtenerRangoSemana().inicio} - {obtenerRangoSemana().fin}
            </p>

            <div className="grafica-wrapper">
              {/* EJE IZQUIERDO */}
              <div className="grafica-eje">
                {[10, 8, 6, 4, 2, 0].map((h, i) => (
                  <span key={i}>{h}h</span>
                ))}
              </div>

              {/* CONTENEDOR DE BARRAS */}
              <div className="grafica-barras">
                {progresoSemanal.length > 0 ? (
                  progresoSemanal.map((item, i) => (
                    <div key={i} className="grafica-dia">
                      <div
                        className="grafica-barra"
                        style={{
                          // limitamos la altura máxima (por ejemplo 10 horas => 200px)
                          height: `${Math.min((item.duracion_horas || 0) * 20, 200)}px`
                        }}
                        title={`${(item.duracion_horas || 0).toFixed(1)}h`}
                      ></div>
                      {/* EJE X → LÍNEA BAJO LAS FECHAS */}
                      <div className="grafica-eje-x"></div>

                      <span className="grafica-dia-txt">
                        {formatearDia(item.fecha)}
                      </span>

                      <span className="grafica-horas-txt">
                        {(item.duracion_horas || 0).toFixed(1)}h
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="grafica-sin-datos">No hay sesiones esta semana.</p>
                )}
              </div>
            </div>


          </section>

          {/* MEDALLAS */}
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

          {/* TROFEOS */}
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
