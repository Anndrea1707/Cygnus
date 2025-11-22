import React, { useState, useEffect } from "react";
import "./Evaluacion.css";

export default function EvaluacionFinal({ curso, evaluacion, onNavigate, onEvaluacionCompletada }) {
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState([]);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
    const [puntaje, setPuntaje] = useState(0);
    const [certificadoGenerado, setCertificadoGenerado] = useState(false);

    const preguntas = evaluacion?.preguntas || [];
    const tiempoTotal = preguntas.length * 2 * 60; // 2 minutos por pregunta en segundos

    // Inicializar el temporizador y las respuestas
    useEffect(() => {
        setRespuestas(new Array(preguntas.length).fill(null));
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
        if (!curso || !evaluacion || preguntas.length === 0) return;

        let correctas = 0;
        respuestas.forEach((r, i) => {
            if (r === preguntas[i].correcta) correctas++;
        });

        const puntajeCalculado = (correctas / preguntas.length) * 100;
        const notaFinal = puntajeCalculado / 20; // 0–100 → 0–5

        setPuntaje(puntajeCalculado);
        setNota(notaFinal);

        // ======================
        // ⭐ REGISTRAR EVALUACIÓN FINAL EN BACKEND
        // ======================
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));

            await fetch("http://localhost:4000/api/progreso/evaluacion-final", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuario._id,
                    cursoId: curso.id,
                    nota: notaFinal
                })
            });

        } catch (error) {
            console.error("Error registrando evaluación final:", error);
        }
        // ======================

        setEvaluacionCompletada(true);
    };

    const descargarCertificado = () => {
        // Aquí iría la lógica para generar y descargar el certificado
        alert("Certificado generado exitosamente!");
    };
    const manejarFinalizarCurso = () => {
        onEvaluacionCompletada(); // <-- viene desde App.jsx
    };

    const pregunta = preguntas[preguntaActual];

    if (evaluacionCompletada) {
        return (
            <div className="evaluacion-completada">
                <div className="evaluacion-header">
                    <h1>🎓 Evaluación Final Completada</h1>
                    <p>Curso: {curso.nombre}</p>
                </div>

                <div className="resultado-container">
                    <div className={`puntaje-circular ${puntaje >= 70 ? 'aprobado' : 'reprobado'}`}>
                        <div className="puntaje-numero">{puntaje.toFixed(0)}%</div>
                        <div className="puntaje-texto">
                            {puntaje >= 70 ? '¡Aprobado!' : 'Reprobado'}
                        </div>
                    </div>

                    <div className="estadisticas">
                        <div className="estadistica">
                            <span className="estadistica-valor">{preguntas.length}</span>
                            <span className="estadistica-label">Total preguntas</span>
                        </div>
                        <div className="estadistica">
                            <span className="estadistica-valor">
                                {respuestas.filter((resp, index) => resp === parseInt(preguntas[index].opcionCorrecta)).length}
                            </span>
                            <span className="estadistica-label">Correctas</span>
                        </div>
                        <div className="estadistica">
                            <span className="estadistica-valor">
                                {respuestas.filter((resp, index) => resp !== parseInt(preguntas[index].opcionCorrecta)).length}
                            </span>
                            <span className="estadistica-label">Incorrectas</span>
                        </div>
                    </div>

                    {certificadoGenerado && (
                        <div className="certificado-section">
                            <div className="certificado-icono">🏆</div>
                            <h3>¡Felicidades! Has aprobado el curso</h3>
                            <p>Tu certificado está listo para descargar</p>
                            <button
                                className="btn-certificado"
                                onClick={descargarCertificado}
                            >
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
                            onClick={() => onEvaluacionCompletada()}
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
            {/* Header de la evaluación */}
            <header className="evaluacion-header">
                <button
                    className="btn-volver-evaluacion"
                    onClick={() => onNavigate("curso-vista", { curso })}
                >
                    ← Volver al curso
                </button>

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
                                    {String.fromCharCode(65 + index)}
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