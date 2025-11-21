import React, { useState, useEffect } from "react";
import "./Evaluacion.css";

export default function EvaluacionModulo({ curso, modulo, moduloIndex, onNavigate, onEvaluacionCompletada }) {
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState([]);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
    const [puntaje, setPuntaje] = useState(0);

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

    const finalizarEvaluacion = () => {
        // Calcular puntaje
        let correctas = 0;
        preguntas.forEach((pregunta, index) => {
            if (respuestas[index] === parseInt(pregunta.opcionCorrecta)) {
                correctas++;
            }
        });

        const puntajeCalculado = (correctas / preguntas.length) * 100;
        setPuntaje(puntajeCalculado);
        setEvaluacionCompletada(true);
    };

    const pregunta = preguntas[preguntaActual];

    if (evaluacionCompletada) {
        return (
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
                            🚀 Continuar al siguiente módulo
                        </button>
                    </div>
                </div>
            </div>
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
                <button 
                    className="btn-volver-evaluacion"
                    onClick={() => onNavigate("curso-contenido", { 
                        curso, 
                        moduloIndex, 
                        contenidoIndex: modulo.contenido.length - 1 
                    })}
                >
                    ← Volver al módulo
                </button>
                
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
                                className={`opcion-item ${
                                    respuestas[preguntaActual] === index ? 'seleccionada' : ''
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