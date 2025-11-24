// CursoVista.jsx
import React, { useState, useEffect } from "react";
import "./CursoVista.css";

export default function CursoVista({ onNavigate, curso }) {
  const [modulosExpandidos, setModulosExpandidos] = useState({});
  const [cursoActual, setCursoActual] = useState(null);
  const [progresoCurso, setProgresoCurso] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [mostrarModalCompletado, setMostrarModalCompletado] = useState(false);
  const [cargandoProgreso, setCargandoProgreso] = useState(false);
  const [mostrarModalEvaluacionFinal, setMostrarModalEvaluacionFinal] = useState(false);
  const [tipoEvaluacionFinal, setTipoEvaluacionFinal] = useState(null);
  const [mostrarDetallesNotas, setMostrarDetallesNotas] = useState(false);
  const [notasDetalladas, setNotasDetalladas] = useState(null);
  const [cargandoNotas, setCargandoNotas] = useState(false);

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

  // Helper: deduplicate and normalize modulosCompletados (usa moduloIndex)
  const normalizarModulosCompletados = (modulosCompletados = []) => {
    const map = new Map();
    for (const m of modulosCompletados) {
      // usar moduloIndex como clave; mantener el último registro para ese módulo
      if (typeof m.moduloIndex !== "number") continue;
      map.set(m.moduloIndex, {
        moduloIndex: m.moduloIndex,
        completado: !!m.completado,
        fechaCompletado: m.fechaCompletado || null,
        notaEvaluacion: typeof m.notaEvaluacion === "number" ? m.notaEvaluacion : 0
      });
    }
    return Array.from(map.values()).sort((a, b) => a.moduloIndex - b.moduloIndex);
  };

  // Cargar progreso cuando el usuario y curso estén disponibles
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!usuario || !cursoActual) {
        console.log("❌ No hay usuario o curso para cargar progreso");
        return;
      }

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
        setCargandoProgreso(true);
        const response = await fetch(`http://localhost:4000/api/progreso/curso/${usuario._id}/${cursoId}`);
        const data = await response.json();

        console.log("📊 Respuesta del progreso:", data);

        if (data.success && data.progreso) {
          // Normalizar modulosCompletados por seguridad
          const progresoNormalizado = {
            ...data.progreso,
            modulosCompletados: normalizarModulosCompletados(data.progreso.modulosCompletados || [])
          };

          setProgresoCurso(progresoNormalizado);
          console.log("✅ Progreso cargado:", progresoNormalizado);

          // MOSTRAR MODAL SOLO SI realmente está COMPLETADO
          if (
            progresoNormalizado.cursoCompletado ||
            (progresoNormalizado.progresoPorcentual >= 100 &&
              progresoNormalizado.evaluacionFinalCompletada)
          ) {
            setMostrarModalCompletado(true);
          }
        } else {
          // Si no hay progreso, inicializar objeto mínimo
          console.log("ℹ️ No hay progreso guardado, asignando progreso inicial");
          setProgresoCurso({
            moduloActual: 0,
            contenidoActual: 0,
            modulosCompletados: [],
            progresoPorcentual: 0,
            cursoCompletado: false,
            evaluacionFinalCompletada: false
          });
        }

      } catch (error) {
        console.error("❌ Error cargando progreso:", error);
        setProgresoCurso(null);
      } finally {
        setCargandoProgreso(false);
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

    const expandidos = {};

    cursoActual.modulos.forEach((_, index) => {
      // Solo expandir módulos NO bloqueados
      if (!moduloBloqueado(index)) {
        expandidos[index] = true;
      }
    });

    setModulosExpandidos(expandidos);
  };

  const colapsarTodos = () => {
    setModulosExpandidos({});
  };

  // Devuelve true si todos los módulos están completados (usa modulosCompletados normalizado)
  const todosLosModulosCompletos = () => {
    if (!cursoActual?.modulos || !progresoCurso) return false;
    const totalModulos = cursoActual.modulos.length;
    const completados = (progresoCurso.modulosCompletados || []).filter(m => m.completado);
    // usar cantidad única (ya normalizamos).
    return completados.length >= totalModulos;
  };

  // Comprueba si el usuario está en estado "solo falta evaluación final":
  const soloFaltaEvaluacionFinal = () => {
    if (!cursoActual || !progresoCurso) return false;
    const tieneEvaluacionFinal = !!(cursoActual.evaluacionFinal && cursoActual.evaluacionFinal.preguntas?.length > 0);
    if (!tieneEvaluacionFinal) return false;
    // todos los módulos completos y la evaluación final NO completada
    return todosLosModulosCompletos() && !progresoCurso.evaluacionFinalCompletada;
  };

  // Función para manejar el inicio/continuación del curso
  // CursoVista.jsx - Modificar la función handleEmpezarCurso
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

    // Si el curso está completado, mostrar modal completado
    if (progresoCurso && progresoCurso.cursoCompletado) {
      setMostrarModalCompletado(true);
      return;
    }

    // ⭐ NUEVO: Cuando solo falta la evaluación final, mostrar modal de confirmación
    if (soloFaltaEvaluacionFinal()) {
      setTipoEvaluacionFinal("final");
      setMostrarModalEvaluacionFinal(true);
      return;
    }

    // Determinar desde dónde continuar
    let moduloInicio = 0;
    let contenidoInicio = 0;

    if (progresoCurso && progresoCurso.progresoPorcentual > 0) {
      // Continuar desde el progreso guardado
      moduloInicio = Math.min(progresoCurso.moduloActual, cursoActual.modulos.length - 1);
      contenidoInicio = progresoCurso.contenidoActual || 0;
    }

    console.log("📍 Navegando a contenido:", { moduloInicio, contenidoInicio });

    onNavigate("curso-contenido", {
      curso: { ...cursoActual, id: cursoId },
      moduloIndex: moduloInicio,
      contenidoIndex: contenidoInicio
    });
  };

  // ⭐ NUEVO: Función para manejar inicio de evaluación final
  const handleIniciarEvaluacionFinal = () => {
    const cursoId = cursoActual._id || cursoActual.id;

    setMostrarModalEvaluacionFinal(false);

    onNavigate("evaluacion-final", {
      curso: { ...cursoActual, id: cursoId },
      evaluacion: cursoActual.evaluacionFinal
    });
  };

  // ⭐ NUEVO: Modal para evaluación final
  const ModalEvaluacionFinal = () => (
    <div className="modal-overlay">
      <div className="modal-confirmacion">
        <div className="modal-header">
          <h2>🎓 Evaluación Final del Curso</h2>
        </div>

        <div className="modal-body">
          <div className="evaluacion-icono">📝</div>
          <p>
            Estás a punto de comenzar la evaluación final del curso{" "}
            <strong>{cursoActual?.nombre}</strong>.
          </p>

          <div className="evaluacion-info">
            <div className="info-item">
              <span>📝 Preguntas:</span>
              <span>{cursoActual?.evaluacionFinal?.preguntas?.length || 0}</span>
            </div>
            <div className="info-item">
              <span>⏱️ Duración estimada:</span>
              <span>{(cursoActual?.evaluacionFinal?.preguntas?.length || 0) * 2} minutos</span>
            </div>
            <div className="info-item">
              <span>🎯 Puntuación mínima:</span>
              <span>70% para aprobar</span>
            </div>
          </div>

          <div className="recomendaciones">
            <h4>📋 Recomendaciones:</h4>
            <ul>
              <li>• Asegúrate de estar en un lugar tranquilo</li>
              <li>• Evita cerrar la ventana durante la evaluación</li>
              <li>• Lee cuidadosamente cada pregunta</li>
              <li>• Revisa tus respuestas antes de finalizar</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-comenzar"
            onClick={handleIniciarEvaluacionFinal}
          >
            🚀 Comenzar evaluación
          </button>

          <button
            className="btn-secundario"
            onClick={() => setMostrarModalEvaluacionFinal(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // móduloBloqueado: lógica segura que usa el array de objetos modulosCompletados
  const moduloBloqueado = (moduloIndex) => {
    if (!progresoCurso) return false; // sin progreso → nada bloqueado

    const actual = typeof progresoCurso.moduloActual === "number" ? progresoCurso.moduloActual : 0;
    const completados = progresoCurso.modulosCompletados || [];

    // Módulo actual y anteriores → SIEMPRE permitidos
    if (moduloIndex <= actual) return false;

    // Siguiente módulo solo permitido si el actual está completado (buscar por moduloIndex)
    const actualCompletado = completados.some(m => Number(m.moduloIndex) === Number(actual) && m.completado === true);
    if (moduloIndex === actual + 1 && actualCompletado) return false;

    // Todos los demás → bloqueados
    return true;
  };

  // ⭐ FUNCIÓN PARA CARGAR NOTAS DETALLADAS
  const cargarNotasDetalladas = async () => {
    if (!usuario || !cursoActual) return;

    try {
      setCargandoNotas(true);
      const cursoId = cursoActual._id || cursoActual.id;
      const response = await fetch(`http://localhost:4000/api/progreso/notas-detalladas/${usuario._id}/${cursoId}`);
      const data = await response.json();

      if (data.success) {
        setNotasDetalladas(data);
        setMostrarDetallesNotas(true);
      } else {
        console.error("Error cargando notas:", data.message);
        alert("Error al cargar los resultados detallados");
      }
    } catch (error) {
      console.error("Error cargando notas detalladas:", error);
      alert("Error de conexión al cargar los resultados");
    } finally {
      setCargandoNotas(false);
    }
  };

  // ⭐ MODAL DE DETALLES DE NOTAS
const ModalDetallesNotas = () => {
  if (!notasDetalladas) return null;

  const { notas, cursoInfo } = notasDetalladas;

  const calcularPromedioModulos = () => {
    const modulosConNota = notas.modulos.filter(mod => mod.tieneEvaluacion && typeof mod.notaEvaluacion === 'number');
    if (modulosConNota.length === 0) return 0;
    
    const suma = modulosConNota.reduce((acc, mod) => acc + mod.notaEvaluacion, 0);
    return (suma / modulosConNota.length).toFixed(1);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-confirmacion modal-detalles-notas">
        <div className="modal-header">
          <h2>📊 Resultados Detallados del Curso</h2>
          <button 
            className="btn-cerrar-modal"
            onClick={() => setMostrarDetallesNotas(false)}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {/* Información general del curso */}
          <div className="resumen-curso">
            <h3>{cursoInfo?.nombre || cursoActual?.nombre}</h3>
            <div className="curso-meta-info">
              <span className="nivel-curso">Nivel: {cursoInfo?.nivel || cursoActual?.nivel}</span>
              <span className="fecha-completado">
                Completado: {formatearFecha(notas.fechaCompletado)}
              </span>
            </div>
          </div>

          {/* Progreso General */}
          <div className="progreso-general">
            <h4>📈 Progreso General</h4>
            <div className="progreso-container">
              <div className="progreso-bar grande">
                <div 
                  className="progreso-fill"
                  style={{ width: `${notas.progresoGeneral || 100}%` }}
                ></div>
              </div>
              <span className="progreso-texto">{notas.progresoGeneral || 100}%</span>
            </div>
          </div>

          {/* Notas de módulos */}
          <div className="seccion-notas">
            <h4>📚 Evaluaciones por Módulo</h4>
            <div className="lista-modulos">
              {notas.modulos.map((modulo, index) => (
                <div key={index} className="item-modulo">
                  <div className="modulo-info">
                    <div className="modulo-header">
                      <span className="modulo-indice">M{modulo.moduloIndex + 1}</span>
                      <span className="modulo-nombre">{modulo.nombre}</span>
                    </div>
                    {modulo.tieneEvaluacion ? (
                      <span className={`nota ${modulo.notaEvaluacion >= 70 ? 'aprobado' : 'reprobado'}`}>
                        {modulo.notaEvaluacion.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="nota sin-evaluacion">Sin evaluación</span>
                    )}
                  </div>
                  
                  {modulo.tieneEvaluacion && (
                    <div className="progreso-nota">
                      <div 
                        className={`barra-progreso ${modulo.notaEvaluacion >= 70 ? 'aprobado' : 'reprobado'}`}
                        style={{ width: `${modulo.notaEvaluacion}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {modulo.fechaCompletado && (
                    <div className="fecha-modulo">
                      Completado: {formatearFecha(modulo.fechaCompletado)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Promedio de módulos */}
            {notas.modulos.some(mod => mod.tieneEvaluacion) && (
              <div className="promedio-modulos">
                <span>Promedio de evaluaciones de módulos:</span>
                <span className="promedio">{calcularPromedioModulos()}%</span>
              </div>
            )}
          </div>

          {/* Evaluación final */}
          {notas.evaluacionFinal.completada && (
            <div className="seccion-notas evaluacion-final">
              <h4>🎓 Evaluación Final</h4>
              <div className="nota-final">
                <div className="nota-info">
                  <span>Calificación final del curso:</span>
                  <span className={`nota final ${notas.evaluacionFinal.nota >= 70 ? 'aprobado' : 'reprobado'}`}>
                    {notas.evaluacionFinal.nota.toFixed(1)}%
                  </span>
                </div>
                <div className="progreso-nota">
                  <div 
                    className={`barra-progreso ${notas.evaluacionFinal.nota >= 70 ? 'aprobado' : 'reprobado'}`}
                    style={{ width: `${notas.evaluacionFinal.nota}%` }}
                  ></div>
                </div>
                <div className="estado-final">
                  {notas.evaluacionFinal.nota >= 70 ? (
                    <span className="estado aprobado">✅ ¡Curso Aprobado!</span>
                  ) : (
                    <span className="estado reprobado">❌ Curso Reprobado</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resumen general */}
          <div className="resumen-general">
            <div className="estadistica">
              <span className="estadistica-valor">
                {notas.modulos.filter(m => m.completado).length}
              </span>
              <span className="estadistica-label">Módulos completados</span>
            </div>
            <div className="estadistica">
              <span className="estadistica-valor">
                {notas.modulos.filter(m => m.tieneEvaluacion).length}
              </span>
              <span className="estadistica-label">Evaluaciones presentadas</span>
            </div>
            <div className="estadistica">
              <span className="estadistica-valor">
                {notas.modulos.filter(m => m.tieneEvaluacion && m.notaEvaluacion >= 70).length}
              </span>
              <span className="estadistica-label">Evaluaciones aprobadas</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-primario"
            onClick={() => setMostrarDetallesNotas(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ⭐ ACTUALIZAR EL MODAL DE CURSO COMPLETADO EXISTENTE
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
          <div 
            className="opcion" 
            onClick={cargarNotasDetalladas}
            disabled={cargandoNotas}
          >
            <div className="opcion-icono">📊</div>
            <div className="opcion-contenido">
              <h4>Ver Resultados Detallados</h4>
              <p>Revisa tus calificaciones por módulo y evaluación final</p>
              {cargandoNotas && <div className="cargando-mini">Cargando...</div>}
            </div>
          </div>
          
          <div 
            className="opcion" 
            onClick={() => setMostrarModalCompletado(false)}
          >
            <div className="opcion-icono">📚</div>
            <div className="opcion-contenido">
              <h4>Revisar Contenido</h4>
              <p>Puedes volver a revisar cualquier parte del curso</p>
            </div>
          </div>
          
          <div 
            className="opcion" 
            onClick={reiniciarProgreso}
          >
            <div className="opcion-icono">🔄</div>
            <div className="opcion-contenido">
              <h4>Reiniciar Progreso</h4>
              <p>Comenzar desde cero y volver a tomar las evaluaciones</p>
            </div>
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
      </div>
    </div>
  </div>
);

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
        // normalizar si viene modulosCompletados
        const progresoNormalizado = {
          ...data.progreso,
          modulosCompletados: normalizarModulosCompletados(data.progreso?.modulosCompletados || [])
        };
        setProgresoCurso(progresoNormalizado);
        setMostrarModalCompletado(false);
        console.log("✅ Progreso reiniciado:", progresoNormalizado);
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

  // calcular número único de módulos completados para mostrar en UI
  const contadorModulosCompletados = (progresoCurso?.modulosCompletados || []).filter(m => m.completado).length;

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

              {/* ✅ SECCIÓN DE PROGRESO - SOLO SI HAY USUARIO Y PROGRESO > 0 */}
              {usuario && progresoCurso && progresoCurso.progresoPorcentual > 0 && (
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
                      <span className="progreso-valor">
                        {Math.min((progresoCurso.moduloActual || 0) + 1, cursoActual.modulos?.length)} de {cursoActual.modulos?.length}
                      </span>
                    </div>
                    {contadorModulosCompletados > 0 && (
                      <div className="progreso-item">
                        <span className="progreso-label">Módulos completados:</span>
                        <span className="progreso-valor">{contadorModulosCompletados}</span>
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
                disabled={cargandoProgreso}
              >
                {!usuario ? (
                  '🔐 Iniciar sesión para empezar'
                ) : progresoCurso && progresoCurso.cursoCompletado ? (
                  '🎉 Curso Completado - Ver Detalles'
                ) : soloFaltaEvaluacionFinal() ? (
                  `🚨 Continuar con evaluación final`
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
                  className={`modulo-header 
    ${modulosExpandidos[moduloIndex] ? 'expandido' : ''} 
    ${moduloBloqueado(moduloIndex) ? 'modulo-bloqueado' : ''}`
                  }
                  onClick={() => {
                    if (!moduloBloqueado(moduloIndex)) {
                      toggleModulo(moduloIndex);
                    }
                  }}
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

      {/* ⭐ NUEVO: Modal de evaluación final */}
      {mostrarModalEvaluacionFinal && <ModalEvaluacionFinal />}
    </div>
  );
}
