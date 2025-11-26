import React, { useState, useEffect } from "react";
import "./TomarPrueba.css";

function TomarPrueba({ usuario, onPruebaCompletada }) {
    const [prueba, setPrueba] = useState(null);
    const [respuestas, setRespuestas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        // ✅ Verificar si el usuario ya completó la prueba
        if (usuario?.prueba_conocimiento?.completada) {
            onPruebaCompletada();
            return;
        }

        cargarPrueba();
    }, [usuario, onPruebaCompletada]);

    const cargarPrueba = async () => {
        // ✅ No cargar si ya completó la prueba
        if (usuario?.prueba_conocimiento?.completada) {
            onPruebaCompletada();
            return;
        }

        try {
            setCargando(true);
            setError("");

            console.log("🔍 Cargando prueba diagnóstica única...");

            const response = await fetch("/api/pruebas/actual");

            console.log("📡 Status de respuesta:", responseconst response = await fetch('http://localhost:4000/api/pruebas/calificar', {
.status);

            if (response.status === 404) {
                setError("No hay prueba diagnóstica disponible en este momento.");
                setCargando(false);
                return;
            }

            const result = await response.json();
            console.log("📊 Resultado de la búsqueda:", result);

            if (result.success) {
                setPrueba(result.prueba);
                setRespuestas(Array(result.prueba.preguntas.length).fill(null));
            } else {
                setError("No hay prueba diagnóstica disponible en este momento.");
            }
        } catch (error) {
            console.error("Error al cargar prueba:", error);
            setError("Error al cargar la prueba. Intenta nuevamente.");
        } finally {
            setCargando(false);
        }
    };

    const manejarRespuesta = (preguntaIndex, opcionIndex) => {
        const nuevasRespuestas = [...respuestas];
        nuevasRespuestas[preguntaIndex] = opcionIndex;
        setRespuestas(nuevasRespuestas);
    };

    const enviarPrueba = async () => {
        // Validar que todas las preguntas estén respondidas
        if (respuestas.some(resp => resp === null)) {
            alert("Por favor responde todas las preguntas antes de enviar");
            return;
        }

        setEnviando(true);

        try {
            const response = await fetch('http://localhost:4000/api/pruebas/calificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuarioId: usuario._id,
                    pruebaId: prueba._id,
                    respuestas: respuestas
                })
            });

            const result = await response.json();

            if (result.success) {
                setResultado(result);
                setMostrarModal(true);
            } else {
                alert("Error al calificar la prueba: " + result.message);
            }
        } catch (error) {
            console.error("Error al enviar prueba:", error);
            alert("Error de conexión al enviar la prueba");
        } finally {
            setEnviando(false);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        onPruebaCompletada();
    };

    if (cargando) {
        return (
            <div className="prueba-fondo">
                <div className="prueba-card">
                    <div className="cargando-prueba">
                        <div className="spinner"></div>
                        <h3>Cargando prueba diagnóstica...</h3>
                        <p>Preparando tu evaluación</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="prueba-fondo">
                <div className="prueba-card">
                    <div className="error-prueba">
                        <div className="error-icon">⚠️</div>
                        <h2>No se puede cargar la prueba</h2>
                        <p>{error}</p>
                        <button onClick={onPruebaCompletada} className="btn-continuar">
                            Continuar al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!prueba) {
        return (
            <div className="prueba-fondo">
                <div className="prueba-card">
                    <div className="error-prueba">
                        <div className="error-icon">📝</div>
                        <h2>Prueba no disponible</h2>
                        <p>No hay prueba diagnóstica disponible en este momento.</p>
                        <button onClick={onPruebaCompletada} className="btn-continuar">
                            Continuar al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="prueba-fondo">
                <div className="prueba-card">
                    <h2 className="prueba-titulo">Prueba Diagnóstica</h2>
                    <p className="prueba-subtitulo">
                        Responde las siguientes preguntas para determinar tu nivel de habilidad inicial
                    </p>

                    <div className="prueba-info">
                        <span>⏱️ Tómate tu tiempo</span>
                        <span>📝 {prueba.preguntas.length} preguntas</span>
                        <span>🎯 Diagnóstico personalizado</span>
                    </div>

                    <div className="preguntas-container">
                        {prueba.preguntas.map((pregunta, preguntaIndex) => (
                            <div key={preguntaIndex} className="pregunta">
                                <label className="pregunta-label">
                                    {preguntaIndex + 1}. {pregunta.enunciado}
                                </label>

                                <div className="opciones-container">
                                    {pregunta.opciones.map((opcion, opcionIndex) => (
                                        <label key={opcionIndex} className="opcion-label">
                                            <input
                                                type="radio"
                                                name={`pregunta-${preguntaIndex}`}
                                                value={opcionIndex}
                                                checked={respuestas[preguntaIndex] === opcionIndex}
                                                onChange={() => manejarRespuesta(preguntaIndex, opcionIndex)}
                                            />
                                            <span className="opcion-letra">{opcion.letra}</span>
                                            <span className="opcion-texto">{opcion.texto}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="prueba-actions">
                        <div className="progreso">
                            {respuestas.filter(r => r !== null).length} de {prueba.preguntas.length} preguntas respondidas
                        </div>

                        <button
                            onClick={enviarPrueba}
                            disabled={enviando || respuestas.some(resp => resp === null)}
                            className="btn-enviar"
                        >
                            {enviando ? "Enviando..." : "Finalizar Prueba"}
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE RESULTADO */}
            {mostrarModal && resultado && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <div className="modal-icon">🎯</div>
                        <h3>¡Prueba Completada!</h3>
                        <div className="resultado-detalles">
                            <p>Tu nivel de habilidad es: <strong className="nivel-habilidad">Nivel {resultado.habilidad}/5</strong></p>
                            <p>Puntuación: <strong>{resultado.puntuacion.toFixed(1)}%</strong></p>
                            <p>Respuestas correctas: <strong>{resultado.correctas}</strong></p>
                        </div>
                        <p className="mensaje-motivacion">
                            {resultado.habilidad >= 4
                                ? "¡Excelente! Tienes buenos conocimientos base."
                                : resultado.habilidad >= 3
                                    ? "Buen trabajo. Tienes una base sólida para comenzar."
                                    : "No te preocupes, este es tu punto de partida para mejorar."
                            }
                        </p>
                        <button className="modal-btn-aceptar" onClick={cerrarModal}>
                            Continuar al Dashboard
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default TomarPrueba;