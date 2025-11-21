import React, { useState } from "react";
import "./PruebaConocimiento.css";

export default function PruebaConocimiento({ onNavigate }) {
    const [pruebaData, setPruebaData] = useState({
        preguntas: Array(5).fill().map(() => ({
            pregunta: "",
            opciones: ["", "", "", ""],
            respuestaCorrecta: 0
        }))
    });

    // Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensaje, setModalMensaje] = useState("");
    const [modalTitulo, setModalTitulo] = useState("");
    const [modalIcono, setModalIcono] = useState("");

    const mostrarAlerta = (icono, titulo, mensaje) => {
        setModalIcono(icono);
        setModalTitulo(titulo);
        setModalMensaje(mensaje);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
    };

    const handlePreguntaChange = (index, field, value) => {
        const nuevasPreguntas = [...pruebaData.preguntas];

        if (field === "pregunta") {
            nuevasPreguntas[index].pregunta = value;
        } else if (field.startsWith("opcion")) {
            const opcionIndex = parseInt(field.replace("opcion", ""));
            nuevasPreguntas[index].opciones[opcionIndex] = value;
        } else if (field === "respuestaCorrecta") {
            nuevasPreguntas[index].respuestaCorrecta = parseInt(value);
        }

        setPruebaData({
            ...pruebaData,
            preguntas: nuevasPreguntas
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDACIONES
        for (let i = 0; i < pruebaData.preguntas.length; i++) {
            const pregunta = pruebaData.preguntas[i];

            if (!pregunta.pregunta.trim()) {
                mostrarAlerta("❌", "Pregunta vacía", `La pregunta ${i + 1} no puede estar vacía`);
                return;
            }

            for (let j = 0; j < pregunta.opciones.length; j++) {
                if (!pregunta.opciones[j].trim()) {
                    mostrarAlerta("❌", "Opción vacía", `La opción ${j + 1} de la pregunta ${i + 1} no puede estar vacía`);
                    return;
                }
            }

            const opcionesUnicas = new Set(
                pregunta.opciones.map(op => op.toLowerCase().trim())
            );

            if (opcionesUnicas.size !== pregunta.opciones.length) {
                mostrarAlerta("❌", "Opciones repetidas", `La pregunta ${i + 1} tiene opciones repetidas`);
                return;
            }
        }

        try {
            // 1️⃣ VERIFICAR SI YA EXISTE UNA PRUEBA
            const verificacionResponse = await fetch("http://localhost:4000/api/pruebas/verificar-existe", {
                method: "GET",
            });

            const verificacionResult = await verificacionResponse.json();

            if (verificacionResult.existe) {
                mostrarAlerta("❌", "Prueba existente", "Ya existe una prueba diagnóstica. Solo se puede tener UNA.");
                return;
            }

            // 2️⃣ CREAR LA PRUEBA
            const response = await fetch("http://localhost:4000/api/pruebas/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preguntas: pruebaData.preguntas,
                }),
            });

            const result = await response.json();

            if (result.success) {
                mostrarAlerta("✅", "¡Éxito!", "Prueba creada exitosamente");
                setTimeout(() => onNavigate("paneladmin"), 1500);
            } else {
                mostrarAlerta("❌", "Error", result.message || "No se pudo crear la prueba");
            }

        } catch (error) {
            mostrarAlerta("❌", "Error de conexión", error.message);
        }
    };

    const volverAlPanel = () => {
        onNavigate("paneladmin");
    };

    return (
        <div className="prueba-conocimiento-container">

            <div className="prueba-header">
                <button className="back-btn" onClick={volverAlPanel}>
                    ← Volver al Panel
                </button>
                <h1>Crear Prueba Diagnóstica</h1>
            </div>

            <form onSubmit={handleSubmit} className="prueba-form">

                {/* Preguntas */}
                <div className="preguntas-container">
                    <h2 className="preguntas-titulo">Preguntas (5 en total)</h2>

                    {pruebaData.preguntas.map((pregunta, preguntaIndex) => (
                        <div key={preguntaIndex} className="pregunta-card">

                            <div className="pregunta-header">
                                <h3>Pregunta {preguntaIndex + 1}</h3>
                            </div>

                            <div className="pregunta-input-group">
                                <label className="form-label">Enunciado *</label>
                                <textarea
                                    value={pregunta.pregunta}
                                    onChange={(e) =>
                                        handlePreguntaChange(preguntaIndex, "pregunta", e.target.value)
                                    }
                                    placeholder="Escribe la pregunta..."
                                    className="pregunta-textarea"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="opciones-container">
                                <label className="form-label">Opciones *</label>
                                {pregunta.opciones.map((opcion, opcionIndex) => (
                                    <div key={opcionIndex} className="opcion-input-group">
                                        <span className="opcion-letra">
                                            {String.fromCharCode(65 + opcionIndex)}
                                        </span>
                                        <input
                                            type="text"
                                            value={opcion}
                                            onChange={(e) =>
                                                handlePreguntaChange(
                                                    preguntaIndex,
                                                    `opcion${opcionIndex}`,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`Opción ${String.fromCharCode(65 + opcionIndex)}...`}
                                            className="opcion-input"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="respuesta-correcta-group">
                                <label className="form-label">Respuesta correcta *</label>
                                <div className="opciones-radio">
                                    {pregunta.opciones.map((opcion, opcionIndex) => (
                                        <label key={opcionIndex} className="radio-label">
                                            <input
                                                type="radio"
                                                name={`respuestaCorrecta-${preguntaIndex}`}
                                                value={opcionIndex}
                                                checked={pregunta.respuestaCorrecta === opcionIndex}
                                                onChange={(e) =>
                                                    handlePreguntaChange(
                                                        preguntaIndex,
                                                        "respuestaCorrecta",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                            <span className="radio-custom"></span>
                                            {String.fromCharCode(65 + opcionIndex)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-buttons">
                    <button type="button" className="btn-cancelar" onClick={volverAlPanel}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-crear">
                        Crear Prueba
                    </button>
                </div>
            </form>

            {/* Modal */}
            {mostrarModal && (
                <div className="modal-overlay-prueba">
                    <div className="modal-prueba">
                        <div className="modal-icon-prueba">{modalIcono}</div>
                        <h3>{modalTitulo}</h3>
                        <p>{modalMensaje}</p>
                        <button className="modal-btn-aceptar" onClick={cerrarModal}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
