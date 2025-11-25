import React, { useState, useEffect } from "react";
import "./Evaluacion.css";

export default function EvaluacionModulo({ curso, modulo, moduloIndex, onNavigate, onEvaluacionCompletada }) {
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState([]);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
    const [puntaje, setPuntaje] = useState(0);
    const [mostrarModalFinal, setMostrarModalFinal] = useState(false);
    const [preguntasAdaptativas, setPreguntasAdaptativas] = useState([]);

    const preguntas = modulo?.evaluacion?.preguntas || [];
    const tiempoTotal = preguntas.length * 2 * 60; // 2 minutos por pregunta en segundos

    // Inicializar el temporizador y las respuestas
    useEffect(() => {
        // Inicializar array de respuestas
        setRespuestas(new Array(preguntas.length).fill(null));

        // Iniciar temporizador
        setTiempoRestante(tiempoTotal);

        const timer = setInterval(() => {
            setTiempoRestante(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finalizarEvaluacion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // useEffect para cargar preguntas adaptativas
    useEffect(() => {
        const cargarPreguntasAdaptativas = async () => {
            if (!modulo?.evaluacion?.preguntas || !curso) return;

            try {
                const usuario = JSON.parse(localStorage.getItem("usuario"));

                const response = await fetch('http://localhost:4000/api/modelos-matematicos/seleccionar-preguntas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        preguntas: modulo.evaluacion.preguntas,
                        usuario: usuario,
                        tipoEvaluacion: 'modulo', // 10 preguntas para módulo
                        cursoId: curso._id || curso.id
                    })
                });

                const data = await response.json();
                if (data.success) {
                    setPreguntasAdaptativas(data.preguntasSeleccionadas);
                } else {
                    // Fallback: usar todas las preguntas
                    setPreguntasAdaptativas(modulo.evaluacion.preguntas);
                }
            } catch (error) {
                console.error('Error cargando preguntas adaptativas:', error);
                setPreguntasAdaptativas(modulo.evaluacion.preguntas);
            }
        };

        cargarPreguntasAdaptativas();
    }, [modulo, curso]);

    const formatearTiempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
    };

    const manejarRespuesta = (opcionIndex) => {
        const nuevasRespuestas = [...respuestas];
        nuevasRespuestas[preguntaActual] = opcionIndex;
        setRespuestas(nuevasRespuestas);
    };

    const siguientePregunta = () => {
        if (preguntaActual < preguntas.length - 1) {
            setPreguntaActual(prev => prev + 1);
        } else {
            finalizarEvaluacion();
        }
    };

    const preguntaAnterior = () => {
        if (preguntaActual > 0) {
            setPreguntaActual(prev => prev - 1);
        }
    };

    const finalizarEvaluacion = async () => {
        if (!curso || !modulo || preguntas.length === 0) return;

        let correctas = 0;
        respuestas.forEach((r, i) => {
            // ⭐ CORRECCIÓN: Usar opcionCorrecta y asegurar que sea número
            const opcionCorrecta = typeof preguntas[i].opcionCorrecta === 'string'
                ? parseInt(preguntas[i].opcionCorrecta)
                : preguntas[i].opcionCorrecta;

            if (r === opcionCorrecta) correctas++;
        });

        const puntajeCalculado = (correctas / preguntas.length) * 100;
        const notaFinal = puntajeCalculado; // ⬅️ Enviar el porcentaje directamente (0-100)

        setPuntaje(puntajeCalculado);

        // ⭐ REGISTRAR EVALUACIÓN EN BACKEND
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            const cursoId = curso._id || curso.id; // ✅ Usar _id

            const response = await fetch("http://localhost:4000/api/progreso/completar-modulo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuario._id,
                    cursoId: cursoId, // ✅ Usar _id
                    moduloIndex: moduloIndex,
                    nota: notaFinal
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log("✅ Evaluación guardada:", result);

                // ✅ ACTUALIZAR LOCALSTORAGE CON LA NUEVA HABILIDAD
                const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
                const usuarioActualizado = {
                    ...usuarioActual,
                    habilidad_nueva: result.habilidad_nueva
                };
                localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
                console.log("🔄 localStorage actualizado con habilidad_nueva:", result.habilidad_nueva);
            }

        } catch (error) {
            console.error("Error enviando evaluación:", error);
        }

        setEvaluacionCompletada(true);
    };

    // Función para manejar continuar
    const manejarContinuar = () => {
        const esUltimoModulo = moduloIndex === curso.modulos.length - 1;

        if (esUltimoModulo) {
            // Mostrar modal de confirmación
            setMostrarModalFinal(true);
        } else {
            // Continuar con la navegación normal
            if (onEvaluacionCompletada) {
                onEvaluacionCompletada(moduloIndex);
            }
        }
    };


    // En EvaluacionModulo.jsx - modificar la función irAEvaluacionFinal
    const irAEvaluacionFinal = () => {
        setMostrarModalFinal(false);

        // Navegar directamente a EvaluacionFinal
        onNavigate("evaluacion-final", {
            curso,
            evaluacion: curso.evaluacionFinal
        });
    };


    const volverAlCurso = () => {
        setMostrarModalFinal(false);
        onNavigate("curso-vista", { curso });
    };

    const pregunta = preguntas[preguntaActual];

    if (evaluacionCompletada) {
        return (
            <>
                <div className="evaluacion-completada">
                    <div className="evaluacion-header">
                        <h1>🎯 Evaluación Completada</h1>
                        <p>Módulo: {modulo.nombre}</p>
                    </div>

                    <div className="resultado-container">
                        <div className="puntaje-circular">
                            <div className="puntaje-numero">{puntaje.toFixed(0)}%</div>
                            <div className="puntaje-texto">Puntaje</div>
                        </div>

                        <div className="estadisticas">
                            <div className="estadistica">
                                <span className="estadistica-valor">{preguntas.length}</span>
                                <span className="estadistica-label">Total preguntas</span>
                            </div>
                            <div className="estadistica">
                                <span className="estadistica-valor">
                                    {respuestas.filter((resp, index) => {
                                        // ⭐ CORRECCIÓN: Usar opcionCorrecta y asegurar que sea número
                                        const opcionCorrecta = typeof preguntas[index].opcionCorrecta === 'string'
                                            ? parseInt(preguntas[index].opcionCorrecta)
                                            : preguntas[index].opcionCorrecta;
                                        return resp === opcionCorrecta;
                                    }).length}
                                </span>
                                <span className="estadistica-label">Correctas</span>
                            </div>
                            <div className="estadistica">
                                <span className="estadistica-valor">
                                    {respuestas.filter((resp, index) => {
                                        // ⭐ CORRECCIÓN: Usar opcionCorrecta y asegurar que sea número
                                        const opcionCorrecta = typeof preguntas[index].opcionCorrecta === 'string'
                                            ? parseInt(preguntas[index].opcionCorrecta)
                                            : preguntas[index].opcionCorrecta;
                                        return resp !== opcionCorrecta;
                                    }).length}
                                </span>
                                <span className="estadistica-label">Incorrectas</span>
                            </div>
                        </div>

                        <div className="acciones-resultado">
                            <button
                                className="btn-volver-curso"
                                onClick={() => onNavigate("curso-vista", { curso })}
                            >
                                🏠 Volver al curso
                            </button>
                            <button
                                className="btn-continuar"
                                onClick={manejarContinuar}
                            >
                                {moduloIndex === curso.modulos.length - 1 ?
                                    '🎓 Ir a evaluación final' :
                                    '🚀 Continuar al siguiente módulo'
                                }
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal para evaluación final */}
                {mostrarModalFinal && (
                    <div className="modal-overlay">
                        <div className="modal-confirmacion">
                            <div className="modal-header">
                                <h2>🎓 ¡Módulos Completados!</h2>
                            </div>
                            <div className="modal-body">
                                <p>Has completado todos los módulos del curso <strong>{curso.nombre}</strong>.</p>
                                <p>¿Deseas continuar con la evaluación final?</p>
                                <div className="evaluacion-info">
                                    <div className="info-item">
                                        <span>📝 Preguntas:</span>
                                        <span>{curso.evaluacionFinal?.preguntas?.length || 0}</span>
                                    </div>
                                    <div className="info-item">
                                        <span>⏱️ Duración:</span>
                                        <span>{curso.evaluacionFinal ? `${curso.evaluacionFinal.preguntas.length * 2} minutos` : 'No disponible'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn-volver"
                                    onClick={volverAlCurso}
                                >
                                    Volver al curso
                                </button>
                                <button
                                    className="btn-continuar"
                                    onClick={irAEvaluacionFinal}
                                    disabled={!curso.evaluacionFinal || !curso.evaluacionFinal.preguntas || curso.evaluacionFinal.preguntas.length === 0}
                                >
                                    Ir a evaluación final modulo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (!pregunta) {
        return (
            <div className="evaluacion-error">
                <h2>Error al cargar la evaluación</h2>
                <button onClick={() => onNavigate("curso-contenido", { curso, moduloIndex, contenidoIndex: 0 })}>
                    ← Volver al curso
                </button>
            </div>
        );
    }

    return (
        <div className="evaluacion">
            {/* Header de la evaluación */}
            <header className="evaluacion-header">

                <div className="evaluacion-info">
                    <h1>📝 Evaluación del Módulo</h1>
                    <p>{modulo.nombre}</p>
                </div>

                <div className="temporizador">
                    ⏱️ {formatearTiempo(tiempoRestante)}
                </div>
            </header>

            {/* Progreso */}
            <div className="evaluacion-progreso">
                <div className="progreso-bar">
                    <div
                        className="progreso-fill"
                        style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}
                    ></div>
                </div>
                <div className="progreso-texto">
                    Pregunta {preguntaActual + 1} de {preguntas.length}
                </div>
            </div>

            {/* Pregunta actual */}
            <main className="evaluacion-contenido">
                <div className="pregunta-card">
                    <div className="pregunta-header">
                        <span className="dificultad-badge">
                            Dificultad: {pregunta.dificultad}/5
                        </span>
                    </div>

                    <h2 className="pregunta-texto">{pregunta.interrogante}</h2>

                    <div className="opciones-lista">
                        {pregunta.opciones.map((opcion, index) => (
                            <div
                                key={index}
                                className={`opcion-item ${respuestas[preguntaActual] === index ? 'seleccionada' : ''
                                    }`}
                                onClick={() => manejarRespuesta(index)}
                            >
                                <div className="opcion-indice">
                                    {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                                </div>
                                <div className="opcion-texto">{opcion}</div>
                                <div className="opcion-check">
                                    {respuestas[preguntaActual] === index && '✓'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Navegación */}
            <footer className="evaluacion-navegacion">
                <button
                    className="btn-anterior-pregunta"
                    onClick={preguntaAnterior}
                    disabled={preguntaActual === 0}
                >
                    ← Anterior
                </button>

                <div className="contador-preguntas">
                    {preguntaActual + 1} / {preguntas.length}
                </div>

                {preguntaActual < preguntas.length - 1 ? (
                    <button
                        className="btn-siguiente-pregunta"
                        onClick={siguientePregunta}
                        disabled={respuestas[preguntaActual] === null}
                    >
                        Siguiente →
                    </button>
                ) : (
                    <button
                        className="btn-finalizar-evaluacion"
                        onClick={finalizarEvaluacion}
                        disabled={respuestas[preguntaActual] === null}
                    >
                        🏁 Finalizar evaluación
                    </button>
                )}
            </footer>
        </div>
    );
}