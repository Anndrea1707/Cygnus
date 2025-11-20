import React, { useState } from "react";
import "./PruebaConocimiento.css";

export default function PruebaConocimiento({ onNavigate, categoriaPreSeleccionada }) {
    const [pruebaData, setPruebaData] = useState({
        categoria: categoriaPreSeleccionada || "",
        preguntas: Array(5).fill().map(() => ({
            pregunta: "",
            opciones: ["", "", "", ""],
            respuestaCorrecta: 0
        }))
    });

    // Estados para el modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensaje, setModalMensaje] = useState("");
    const [modalTitulo, setModalTitulo] = useState("");
    const [modalIcono, setModalIcono] = useState("");

    const categorias = [
        "matematicas",
        "tecnologia",
        "idiomas"
    ];

    const mostrarAlerta = (icono, titulo, mensaje) => {
        setModalIcono(icono);
        setModalTitulo(titulo);
        setModalMensaje(mensaje);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
    };

    const handleCategoriaChange = (e) => {
        setPruebaData({
            ...pruebaData,
            categoria: e.target.value
        });
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

        // Validaciones básicas
        if (!pruebaData.categoria) {
            mostrarAlerta("❌", "Categoría requerida", "Por favor selecciona una categoría");
            return;
        }

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

            const opcionesUnicas = new Set(pregunta.opciones.map(op => op.toLowerCase().trim()));
            if (opcionesUnicas.size !== pregunta.opciones.length) {
                mostrarAlerta("❌", "Opciones repetidas", `La pregunta ${i + 1} tiene opciones repetidas`);
                return;
            }
        }

        try {
            console.log('📤 Enviando datos al servidor:', pruebaData);

            // PRIMERO VERIFICAR LA CATEGORÍA
            const verificacionResponse = await fetch('http://localhost:4000/api/pruebas/verificar-categoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoria: pruebaData.categoria })
            });

            const verificacionResult = await verificacionResponse.json();
            console.log('🔍 Resultado verificación:', verificacionResult);

            if (verificacionResult.existe) {
                mostrarAlerta("❌", "Categoría existente", `Ya existe una prueba activa en la categoría ${pruebaData.categoria}. Solo se permite una prueba por categoría.`);
                return;
            }

            // SI NO EXISTE, ENTONCES CREAR
            const usuario = JSON.parse(localStorage.getItem("usuario"));

            const response = await fetch('http://localhost:4000/api/pruebas/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categoria: pruebaData.categoria,
                    preguntas: pruebaData.preguntas
                })
            });

            const result = await response.json();
            console.log('📥 Respuesta del servidor:', result);

            if (result.success) {
                mostrarAlerta("✅", "¡Éxito!", "Prueba creada exitosamente");
                // Navegar al panel admin después de cerrar el modal
                setTimeout(() => {
                    onNavigate("paneladmin");
                }, 2000);
            } else {
                mostrarAlerta("❌", "Error", `Error al crear la prueba: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            mostrarAlerta("❌", "Error de conexión", 'Error de conexión al crear la prueba: ' + error.message);
        }
    };

    const volverAlPanel = () => {
        onNavigate("paneladmin");
    };

    return (
        <div className="prueba-conocimiento-container">
            {/* BOTÓN VOLVER */}
            <div className="prueba-header">
                <button className="btn-volver" onClick={volverAlPanel}>
                    ← Volver al Panel
                </button>
                <h1>Crear Prueba de Conocimiento</h1>
            </div>

            <form onSubmit={handleSubmit} className="prueba-form">

                {/* SELECCIÓN DE CATEGORÍA */}
                <div className="categoria-section">
                    <label htmlFor="categoria" className="form-label">
                        Categoría de la Prueba *
                    </label>
                    <select
                        id="categoria"
                        value={pruebaData.categoria}
                        onChange={handleCategoriaChange}
                        className="categoria-select"
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((categoria, index) => (
                            <option key={index} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>

                {/* FORMULARIO DE PREGUNTAS */}
                <div className="preguntas-container">
                    <h2 className="preguntas-titulo">Preguntas (5 en total)</h2>

                    {pruebaData.preguntas.map((pregunta, preguntaIndex) => (
                        <div key={preguntaIndex} className="pregunta-card">
                            <div className="pregunta-header">
                                <h3>Pregunta {preguntaIndex + 1}</h3>
                            </div>

                            {/* ENUNCIADO DE LA PREGUNTA */}
                            <div className="pregunta-input-group">
                                <label className="form-label">
                                    Enunciado de la pregunta *
                                </label>
                                <textarea
                                    value={pregunta.pregunta}
                                    onChange={(e) => handlePreguntaChange(preguntaIndex, "pregunta", e.target.value)}
                                    placeholder="Escribe aquí la pregunta..."
                                    className="pregunta-textarea"
                                    rows="3"
                                    required
                                />
                            </div>

                            {/* OPCIONES DE RESPUESTA */}
                            <div className="opciones-container">
                                <label className="form-label">Opciones de respuesta *</label>
                                {pregunta.opciones.map((opcion, opcionIndex) => (
                                    <div key={opcionIndex} className="opcion-input-group">
                                        <span className="opcion-letra">
                                            {String.fromCharCode(65 + opcionIndex)}
                                        </span>
                                        <input
                                            type="text"
                                            value={opcion}
                                            onChange={(e) => handlePreguntaChange(preguntaIndex, `opcion${opcionIndex}`, e.target.value)}
                                            placeholder={`Opción ${String.fromCharCode(65 + opcionIndex)}...`}
                                            className="opcion-input"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* RESPUESTA CORRECTA */}
                            <div className="respuesta-correcta-group">
                                <label className="form-label">
                                    Respuesta correcta *
                                </label>
                                <div className="opciones-radio">
                                    {pregunta.opciones.map((opcion, opcionIndex) => (
                                        <label key={opcionIndex} className="radio-label">
                                            <input
                                                type="radio"
                                                name={`respuestaCorrecta-${preguntaIndex}`}
                                                value={opcionIndex}
                                                checked={pregunta.respuestaCorrecta === opcionIndex}
                                                onChange={(e) => handlePreguntaChange(preguntaIndex, "respuestaCorrecta", parseInt(e.target.value))}
                                                required
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

                {/* BOTONES DE ACCIÓN */}
                <div className="form-buttons">
                    <button type="button" className="btn-cancelar" onClick={volverAlPanel}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-crear">
                        Crear Prueba
                    </button>
                </div>
            </form>

            {/* MODAL PARA ALERTAS */}
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