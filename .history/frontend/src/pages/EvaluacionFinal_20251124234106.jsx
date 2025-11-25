// EvaluacionFinal.jsx - ELIMINAR el modal de inicio y modificar el useEffect
import React, { useState, useEffect } from "react";
import "./Evaluacion.css";

export default function EvaluacionFinal({ curso, evaluacion, onNavigate, onEvaluacionCompletada }) {
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState([]);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
    const [puntaje, setPuntaje] = useState(0);
    const [certificadoGenerado, setCertificadoGenerado] = useState(false);
    const [preguntasAdaptativas, setPreguntasAdaptativas] = useState([]);
    const [cargandoPreguntas, setCargandoPreguntas] = useState(true);

    // useEffect para cargar preguntas adaptativas
    useEffect(() => {
        const cargarPreguntasAdaptativas = async () => {
            if (!evaluacion?.preguntas || !curso) {
                setCargandoPreguntas(false);
                return;
            }

            try {
                const usuario = JSON.parse(localStorage.getItem("usuario"));

                console.log('🔄 Solicitando preguntas adaptativas para evaluación final...');
                
                const response = await fetch('http://localhost:4000/api/modelos-matematicos/seleccionar-preguntas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        preguntas: evaluacion.preguntas,
                        usuario: usuario,
                        tipoEvaluacion: 'final', // 15 preguntas para final
                        cursoId: curso._id || curso.id
                    })
                });

                const data = await response.json();
                if (data.success && data.preguntasSeleccionadas.length > 0) {
                    console.log('✅ Preguntas adaptativas cargadas:', data.preguntasSeleccionadas.length);
                    setPreguntasAdaptativas(data.preguntasSeleccionadas);
                } else {
                    console.log('⚠️ Usando preguntas normales (fallback)');
                    setPreguntasAdaptativas(evaluacion.preguntas);
                }
            } catch (error) {
                console.error('❌ Error cargando preguntas adaptativas:', error);
                setPreguntasAdaptativas(evaluacion.preguntas);
            } finally {
                setCargandoPreguntas(false);
            }
        };

        cargarPreguntasAdaptativas();
    }, [evaluacion, curso]);

    // ✅ INICIALIZAR respuestas cuando se cargan las preguntas adaptativas
    useEffect(() => {
        if (preguntasAdaptativas.length > 0) {
            // Inicializar array de respuestas con el mismo length que preguntas
            setRespuestas(new Array(preguntasAdaptativas.length).fill(null));
            setTiempoRestante(preguntasAdaptativas.length * 2 * 60);
        }
    }, [preguntasAdaptativas]);

    const preguntas = cargandoPreguntas ? [] : 
                     (preguntasAdaptativas.length > 0 ? preguntasAdaptativas : 
                     (evaluacion?.preguntas || []));

    // 🚨 MODIFICAR: Inicializar inmediatamente sin modal
    useEffect(() => {
        if (preguntas.length > 0) {
            // Inicializar sin esperar por modal
            setRespuestas(new Array(preguntas.length).fill(null));
            setTiempoRestante(preguntas.length * 2 * 60);

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
        }
    }, [preguntas]); // 🚨 Dependencia de preguntas

    // const modalInicioEvaluacion = mostrarModalInicio && ( ... )

    const formatearTiempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs < 10 ? "0" : ""}${segs}`;
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
        if (!curso || !evaluacion || preguntas.length === 0) return;

        let correctas = 0;

        // ✅ CORREGIR: USAR SOLO LAS RESPUESTAS QUE CORRESPONDEN A LAS PREGUNTAS EXISTENTES
        respuestas.slice(0, preguntas.length).forEach((respuesta, index) => {
            const pregunta = preguntas[index];
            
            if (!pregunta) {
                console.error(`❌ Pregunta ${index} no encontrada`);
                return;
            }

            if (pregunta.opcionCorrecta === undefined) {
                console.error(`❌ Pregunta ${index} no tiene opcionCorrecta:`, pregunta);
                return;
            }

            const opcionCorrecta = typeof pregunta.opcionCorrecta === "string"
                ? parseInt(pregunta.opcionCorrecta)
                : pregunta.opcionCorrecta;

            if (respuesta === opcionCorrecta) correctas++;
        });

        const puntajeCalculado = (correctas / preguntas.length) * 100;
        const notaFinal = puntajeCalculado;

        setPuntaje(notaFinal);

        // ✅ AGREGAR LOG PARA DEBUG
        console.log('📊 Resultados evaluación final:', {
            totalPreguntas: preguntas.length,
            totalRespuestas: respuestas.length,
            respuestasValidas: respuestas.slice(0, preguntas.length).length,
            correctas: correctas,
            puntaje: puntajeCalculado
        });

        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            const cursoId = curso._id || curso.id;

            // Registrar evaluación final
            const responseEvaluacion = await fetch("http://localhost:4000/api/progreso/evaluacion-final", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuario._id,
                    cursoId: cursoId,
                    notaFinal: notaFinal
                })
            });

            const resultEvaluacion = await responseEvaluacion.json();

            if (resultEvaluacion.success) {
                // Actualizar localStorage con habilidad_nueva
                const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
                if (usuarioActual && resultEvaluacion.habilidad_nueva) {
                    const usuarioActualizado = {
                        ...usuarioActual,
                        habilidad_nueva: resultEvaluacion.habilidad_nueva
                    };
                    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
                }

                // Marcar curso como completado
                const responseCompletado = await fetch("http://localhost:4000/api/progreso/completar-curso", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuarioId: usuario._id,
                        cursoId: cursoId
                    })
                });

                const resultCompletado = await responseCompletado.json();
                if (resultCompletado.success) {
                    setCertificadoGenerado(true);
                }
            }

        } catch (error) {
            console.error("Error registrando evaluación final:", error);
        }

        setEvaluacionCompletada(true);
    };

    const manejarFinalizarCurso = () => {
        if (onEvaluacionCompletada) onEvaluacionCompletada();
    };

    const pregunta = preguntas[preguntaActual];

    // ✅ AGREGAR loading state
    if (cargandoPreguntas) {
        return (
            <div className="evaluacion-cargando">
                <div className="cargando-contenido">
                    <h2>🔄 Cargando evaluación final adaptativa...</h2>
                    <p>Seleccionando las mejores preguntas para ti</p>
                </div>
            </div>
        );
    }

    // 🚨 ELIMINAR la referencia al modal en el return
    if (evaluacionCompletada) {
        // ✅ CALCULAR CORRECTAMENTE LAS ESTADÍSTICAS
        const respuestasValidas = respuestas.slice(0, preguntas.length);
        const correctasCount = respuestasValidas.filter((respuesta, i) => {
            const pregunta = preguntas[i];
            if (!pregunta) return false;
            
            const opcionCorrecta = typeof pregunta.opcionCorrecta === "string"
                ? parseInt(pregunta.opcionCorrecta)
                : pregunta.opcionCorrecta;
                
            return respuesta === opcionCorrecta;
        }).length;

        const incorrectasCount = respuestasValidas.filter((respuesta, i) => {
            const pregunta = preguntas[i];
            if (!pregunta) return false;
            
            const opcionCorrecta = typeof pregunta.opcionCorrecta === "string"
                ? parseInt(pregunta.opcionCorrecta)
                : pregunta.opcionCorrecta;
                
            return respuesta !== opcionCorrecta;
        }).length;

        return (
            <div className="evaluacion-completada">
                <div className="evaluacion-header">
                    <h1>🎓 Evaluación Final Completada</h1>
                    <p>Curso: {curso.nombre}</p>
                </div>

                <div className="resultado-container">
                    <div className={`puntaje-circular ${puntaje >= 70 ? "aprobado" : "reprobado"}`}>
                        <div className="puntaje-numero">{puntaje.toFixed(0)}%</div>
                        <div className="puntaje-texto">
                            {puntaje >= 70 ? "¡Aprobado!" : "Reprobado"}
                        </div>
                    </div>

                    <div className="estadisticas">
                        <div className="estadistica">
                            <span className="estadistica-valor">{preguntas.length}</span>
                            <span className="estadistica-label">Total preguntas</span>
                        </div>
                        <div className="estadistica">
                            <span className="estadistica-valor">
                                {correctasCount}
                            </span>
                            <span className="estadistica-label">Correctas</span>
                        </div>
                        <div className="estadistica">
                            <span className="estadistica-valor">
                                {incorrectasCount}
                            </span>
                            <span className="estadistica-label">Incorrectas</span>
                        </div>
                    </div>

                    {certificadoGenerado && (
                        <div className="certificado-section">
                            <div className="certificado-icono">🏆</div>
                            <h3>¡Felicidades! Has aprobado el curso</h3>
                            <p>Tu certificado está listo para descargar</p>
                            <button className="btn-certificado" onClick={() => alert("Certificado generado")}>
                                📄 Descargar Certificado
                            </button>
                        </div>
                    )}

                    <div className="acciones-resultado">
                        <button
                            className="btn-revisar"
                            onClick={() => setEvaluacionCompletada(false)}
                        >
                            📝 Revisar respuestas
                        </button>
                        <button
                            className="btn-continuar"
                            onClick={manejarFinalizarCurso}
                        >
                            🏠 Volver a cursos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!pregunta) {
        return (
            <div className="evaluacion-error">
                <h2>Error al cargar la evaluación final</h2>
                <button onClick={() => onNavigate("curso-vista", { curso })}>
                    ← Volver al curso
                </button>
            </div>
        );
    }

    return (
        <div className="evaluacion evaluacion-final">
            {/* 🚨 ELIMINADO: {modalInicioEvaluacion} */}

            {/* Header */}
            <header className="evaluacion-header">

                <div className="evaluacion-info">
                    <h1>🎓 Evaluación Final</h1>
                    <p>{curso.nombre}</p>
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

            {/* Pregunta */}
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
                                className={`opcion-item ${respuestas[preguntaActual] === index ? "seleccionada" : ""}`}
                                onClick={() => manejarRespuesta(index)}
                            >
                                <div className="opcion-indice">{String.fromCharCode(65 + index)}</div>
                                <div className="opcion-texto">{opcion}</div>
                                <div className="opcion-check">
                                    {respuestas[preguntaActual] === index && "✓"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer navegación */}
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