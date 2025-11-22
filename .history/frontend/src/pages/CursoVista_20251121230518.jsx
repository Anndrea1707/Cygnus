import React, { useState, useEffect } from "react";
import "./CursoVista.css";

export default function CursoVista({ onNavigate, curso }) {
  const [modulosExpandidos, setModulosExpandidos] = useState({});
  const [cursoActual, setCursoActual] = useState(null);
  const [progresoCurso, setProgresoCurso] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [mostrarModalCompletado, setMostrarModalCompletado] = useState(false);

  // Obtener usuario del localStorage
  useEffect(() => {
    const usuarioLS = localStorage.getItem("usuario");
    if (usuarioLS) {
      try {
        setUsuario(JSON.parse(usuarioLS));
      } catch (error) {
        console.error("Error parsing usuario:", error);
      }
    }
  }, []);

  // Verificar y establecer el curso
  useEffect(() => {
    console.log("📥 Curso recibido en CursoVista:", curso);

    if (curso) {
      console.log("✅ Curso encontrado:", curso.nombre);
      setCursoActual(curso);

      // Expandir el primer módulo por defecto
      if (curso.modulos?.length > 0) {
        setModulosExpandidos({ 0: true });
      }
    } else {
      console.log("❌ No se recibió curso");
    }

    // Ocultar navbar y footer
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('.footer');

    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Restaurar al salir del componente
    return () => {
      if (navbar) navbar.style.display = 'flex';
      if (footer) footer.style.display = 'block';
    };
  }, [curso]);

  // Cargar progreso cuando el usuario y curso estén disponibles
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!usuario || !cursoActual) {
        console.log("❌ No hay usuario o curso para cargar progreso");
        return;
      }

      // ✅ Usar _id de MongoDB (con underscore)
      const cursoId = cursoActual._id || cursoActual.id;

      if (!cursoId) {
        console.error("❌ No se pudo obtener el ID del curso:", cursoActual);
        return;
      }

      console.log("📥 Cargando progreso para:", {
        usuarioId: usuario._id,
        cursoId: cursoId
      });

      try {
        const response = await fetch(`http://localhost:4000/api/progreso/curso/${usuario._id}/${cursoId}`);
        const data = await response.json();

        console.log("📊 Respuesta del progreso:", data);

        if (data.success && data.progreso) {
          setProgresoCurso(data.progreso);
          console.log("✅ Progreso cargado:", data.progreso);

          // ✅ Verificar si el curso está completado al 100%
          if (data.progreso.progresoPorcentual >= 100 || data.progreso.cursoCompletado) {
            setMostrarModalCompletado(true);
          }
        } else {
          console.log("ℹ️ No hay progreso para este curso");
          setProgresoCurso(null);
        }
      } catch (error) {
        console.error("❌ Error cargando progreso:", error);
        setProgresoCurso(null);
      }
    };

    cargarProgreso();
  }, [usuario, cursoActual]);

  const toggleModulo = (index) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const expandirTodos = () => {
    if (!cursoActual?.modulos) return;

    const todosExpandidos = {};
    cursoActual.modulos.forEach((_, index) => {
      todosExpandidos[index] = true;
    });
    setModulosExpandidos(todosExpandidos);
  };

  const colapsarTodos = () => {
    setModulosExpandidos({});
  };

  // Función para manejar el inicio/continuación del curso
  const handleEmpezarCurso = () => {
    if (!usuario) {
      onNavigate("login");
      return;
    }

    const cursoId = cursoActual._id || cursoActual.id;

    if (!cursoId) {
      console.error("❌ No se puede navegar - curso sin ID:", cursoActual);
      return;
    }

    // Si el curso está completado, mostrar modal en lugar de navegar
    if (progresoCurso && (progresoCurso.progresoPorcentual >= 100 || progresoCurso.cursoCompletado)) {
      setMostrarModalCompletado(true);
      return;
    }

    // Navegar normalmente
    const moduloInicio = progresoCurso?.moduloActual || 0;
    const contenidoInicio = progresoCurso?.contenidoActual || 0;

    onNavigate("curso-contenido", {
      curso: { ...cursoActual, id: cursoId },
      moduloIndex: moduloInicio,
      contenidoIndex: contenidoInicio
    });
  };

  // Función para reiniciar progreso
  const reiniciarProgreso = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/progreso/reiniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario._id,
          cursoId: cursoActual._id || cursoActual.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setProgresoCurso(data.progreso);
        setMostrarModalCompletado(false);
        console.log("✅ Progreso reiniciado:", data.progreso);
      }
    } catch (error) {
      console.error("Error reiniciando progreso:", error);
    }
  };

  // Modal de curso completado
  const ModalCursoCompletado = () => (
    <div className="modal-overlay">
      <div className="modal-confirmacion modal-completado">
        <div className="modal-header">
          <h2>🎉 ¡Curso Completado!</h2>
        </div>
        <div className="modal-body">
          <div className="completado-icono">🏆</div>
          <p>¡Felicidades! Has completado el curso <strong>{cursoActual?.nombre}</strong> al 100%.</p>
          <p>¿Qué te gustaría hacer?</p>

          <div className="opciones-completado">
            <div className="opcion">
              <h4>📚 Revisar Contenido</h4>
              <p>Puedes volver a revisar cualquier parte del curso</p>
            </div>
            <div className="opcion">
              <h4>🔄 Reiniciar Progreso</h4>
              <p>Comenzar desde cero y volver a tomar las evaluaciones</p>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="btn-secundario"
            onClick={() => setMostrarModalCompletado(false)}
          >
            Seguir Revisando
          </button>
          <button
            className="btn-reiniciar"
            onClick={reiniciarProgreso}
          >
            🔄 Reiniciar Progreso
          </button>
        </div>
      </div>
    </div>
  );

  // Si no hay curso, mostrar mensaje
  if (!cursoActual) {
    return (
      <div className="curso-detalle">
        <div className="curso-no-encontrado">
          <h2>No se encontró el curso</h2>
          <p>El curso no pudo ser cargado. Por favor, regresa y selecciona un curso nuevamente.</p>
          <button
            className="btn-volver"
            onClick={() => onNavigate("cursosusuario")}
          >
            ← Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  const totalContenidos = cursoActual.modulos?.reduce((total, modulo) =>
    total + (modulo.contenido?.length || 0), 0
  ) || 0;

  return (
    <div className="curso-detalle">
      {/* Header fijo */}
      <header className="curso-header">
        <div className="header-contenido">
          <button
            className="back-btn"
            onClick={() => onNavigate("cursosusuario")}
          >
            ← Volver a cursos
          </button>
          <h1 className="curso-titulo-principal">{cursoActual.nombre}</h1>
        </div>
      </header>

      <div className="curso-contenedor-principal">
        {/* Columna izquierda - Información del curso */}
        <aside className="curso-sidebar">
          <div className="sidebar-contenido">
            <img
              src={cursoActual.imagen}
              alt={cursoActual.nombre}
              className="sidebar-imagen"
            />

            <div className="curso-info-resumen">
              <h3>Acerca de este curso</h3>
              <p className="curso-descripcion-corta">{cursoActual.descripcion}</p>

              <div className="curso-stats">
                <div className="stat-item">
                  <span className="stat-icon">⏱️</span>
                  <div className="stat-info">
                    <span className="stat-valor">{cursoActual.horas || cursoActual.horasEstimadas} horas</span>
                    <span className="stat-label">Duración total</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <div className="stat-info">
                    <span className="stat-valor">{cursoActual.modulos?.length || 0} módulos</span>
                    <span className="stat-label">Estructura del curso</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <div className="stat-info">
                    <span className="stat-valor">{cursoActual.nivel}</span>
                    <span className="stat-label">Nivel</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">📖</span>
                  <div className="stat-info">
                    <span className="stat-valor">{totalContenidos} lecciones</span>
                    <span className="stat-label">Contenidos</span>
                  </div>
                </div>
              </div>

              {/* ✅ SECCIÓN DE PROGRESO - SOLO SI HAY USUARIO */}
              {usuario && progresoCurso && (
                <div className="progreso-global">
                  <h4>Tu progreso</h4>
                  <div className="progreso-bar-global">
                    <div
                      className="progreso-fill-global"
                      style={{ width: `${progresoCurso.progresoPorcentual}%` }}
                    ></div>
                  </div>
                  <span>{Math.round(progresoCurso.progresoPorcentual)}% completado</span>

                  {/* Información adicional del progreso */}
                  <div className="progreso-detalles">
                    <div className="progreso-item">
                      <span className="progreso-label">Módulo actual:</span>
                      <span className="progreso-valor">{progresoCurso.moduloActual + 1} de {cursoActual.modulos?.length}</span>
                    </div>
                    {progresoCurso.modulosCompletados && progresoCurso.modulosCompletados.length > 0 && (
                      <div className="progreso-item">
                        <span className="progreso-label">Módulos completados:</span>
                        <span className="progreso-valor">{progresoCurso.modulosCompletados.length}</span>
                      </div>
                    )}
                    {progresoCurso.evaluacionFinalCompletada && (
                      <div className="progreso-item completado">
                        <span className="progreso-label">✅ Evaluación final:</span>
                        <span className="progreso-valor">Completada</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                className="btn-empezar-curso"
                onClick={handleEmpezarCurso}
              >
                {!usuario ? (
                  '🔐 Iniciar sesión para empezar'
                ) : progresoCurso && progresoCurso.progresoPorcentual >= 100 ? (
                  '🎉 Curso Completado - Ver Detalles'
                ) : progresoCurso && progresoCurso.progresoPorcentual > 0 ? (
                  `🚀 Continuar curso (${Math.round(progresoCurso.progresoPorcentual)}%)`
                ) : (
                  '🚀 Empezar curso'
                )}
              </button>
            </div>

            {/* Información del desarrollador */}
            <div className="desarrollador-info">
              <h4>Desarrollado por</h4>
              <div className="desarrollador-details">
                <p><strong>Melissa Hernández & Ángel Hernández</strong></p>
                <p>Unidades Tecnológicas de Santander - UTS</p>
                <p>Bucaramanga, Santander</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Columna derecha - Contenido del curso */}
        <main className="curso-contenido-principal">
          <div className="contenido-header">
            <h2>Contenido del curso</h2>
            <div className="contenido-acciones">
              <button className="btn-expandir" onClick={expandirTodos}>
                Expandir todo
              </button>
              <button className="btn-colapsar" onClick={colapsarTodos}>
                Colapsar todo
              </button>
            </div>
          </div>

          {/* Línea de tiempo de módulos */}
          <div className="linea-tiempo-curso">
            {cursoActual.modulos && cursoActual.modulos.map((modulo, moduloIndex) => (
              <div key={moduloIndex} className="modulo-seccion">
                <div
                  className={`modulo-header ${modulosExpandidos[moduloIndex] ? 'expandido' : ''}`}
                  onClick={() => toggleModulo(moduloIndex)}
                >
                  <div className="modulo-info-principal">
                    <div className="modulo-numero">
                      M{moduloIndex + 1}
                    </div>
                    <div className="modulo-contenido-info">
                      <h3 className="modulo-titulo">{modulo.nombre}</h3>
                      <p className="modulo-descripcion">{modulo.descripcion}</p>
                      <div className="modulo-meta">
                        <span className="meta-lecciones">
                          {modulo.contenido?.length || 0} lecciones
                        </span>
                        {modulo.evaluacion && (
                          <span className="meta-evaluacion">• Con evaluación</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modulo-acciones">
                    <span className="modulo-toggle">
                      {modulosExpandidos[moduloIndex] ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {/* Contenido del módulo (expandible) */}
                {modulosExpandidos[moduloIndex] && (
                  <div className="modulo-contenido-detalle">
                    {/* Lecciones del módulo */}
                    {modulo.contenido && modulo.contenido.map((contenido, contenidoIndex) => (
                      <div key={contenidoIndex} className="leccion-item">
                        <div className="leccion-icono">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
                            <path d="M11.75 8l-4.5-4.5v9l4.5-4.5z" />
                          </svg>
                        </div>
                        <div className="leccion-contenido">
                          <h4 className="leccion-titulo">{contenido.titulo}</h4>
                          <p className="leccion-descripcion">{contenido.descripcion}</p>
                          <div className="leccion-recursos">
                            {contenido.contenido && (
                              <span className="recurso-tipo">🎥 Contenido principal</span>
                            )}
                            {contenido.recursoExtra && (
                              <span className="recurso-extra">📎 Recurso adicional</span>
                            )}
                          </div>
                        </div>
                        <div className="leccion-duracion">
                          <span className="duracion-badge">15 min</span>
                        </div>
                      </div>
                    ))}

                    {/* Evaluación del módulo */}
                    {modulo.evaluacion && (
                      <div className="evaluacion-modulo">
                        <div className="evaluacion-icono">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h13zm-13-1A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 2h-13z" />
                            <path d="M3 5.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zM3 8a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9A.5.5 0 013 8zm0 2.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z" />
                          </svg>
                        </div>
                        <div className="evaluacion-contenido">
                          <h4 className="evaluacion-titulo">Evaluación: {modulo.evaluacion.titulo}</h4>
                          <p className="evaluacion-descripcion">{modulo.evaluacion.descripcion}</p>
                          <div className="evaluacion-meta">
                            <span className="preguntas-count">
                              {modulo.evaluacion.preguntas?.length || 0} preguntas
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Evaluación final */}
            {cursoActual.evaluacionFinal && (
              <div className="evaluacion-final-seccion">
                <div className="evaluacion-final-header">
                  <div className="evaluacion-final-icono">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="evaluacion-final-info">
                    <h3 className="evaluacion-final-titulo">Evaluación Final: {cursoActual.evaluacionFinal.titulo}</h3>
                    <p className="evaluacion-final-descripcion">{cursoActual.evaluacionFinal.descripcion}</p>
                    <div className="evaluacion-final-meta">
                      <span className="preguntas-count final">
                        {cursoActual.evaluacionFinal.preguntas?.length || 0} preguntas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje si no hay módulos */}
            {(!cursoActual.modulos || cursoActual.modulos.length === 0) && (
              <div className="sin-contenido">
                <div className="sin-contenido-icono">📚</div>
                <h3>Este curso no tiene contenido disponible aún</h3>
                <p>El contenido estará disponible próximamente</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de curso completado */}
      {mostrarModalCompletado && <ModalCursoCompletado />}
    </div>
  );
}