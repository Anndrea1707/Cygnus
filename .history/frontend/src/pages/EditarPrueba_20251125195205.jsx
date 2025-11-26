import React, { useState, useEffect } from "react";
import "./PruebaConocimiento.css";

export default function EditarPrueba({ onNavigate, params }) {

    const [pruebaData, setPruebaData] = useState({
        preguntas: Array(5).fill().map(() => ({
            pregunta: "",
            opciones: ["", "", "", ""],
            respuestaCorrecta: 0
        }))
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pruebaId, setPruebaId] = useState(null);

    // ==========================================
    // CARGAR PRUEBA POR ID
    // ==========================================

    useEffect(() => {
        // Obtener el ID de los parámetros o de la prueba activa
        if (params && params.pruebaId) {
            setPruebaId(params.pruebaId);
            cargarPruebaPorId(params.pruebaId);
        } else {
            cargarPruebaActiva();
        }
    }, [params]);

    const cargarPruebaPorId = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`https://cygnus-xjo4.onrender.com/api/pruebas/${id}`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("📊 Resultado de carga por ID:", result); // Para debug

            if (!result.success) {
                alert("No se pudo cargar la prueba: " + (result.message || "Error desconocido"));
                return onNavigate("gestionarpruebas");
            }

            // CORRECCIÓN: Usar result.data en lugar de result.prueba
            transformarDatosPrueba(result.data);

        } catch (error) {
            console.error("Error cargando prueba por ID:", error);
            alert("Error al cargar la prueba: " + error.message);
            onNavigate("gestionarpruebas");
        } finally {
            setLoading(false);
        }
    };

    const cargarPruebaActiva = async () => {
        try {
            setLoading(true);
            const response = await fetch("https://cygnus-xjo4.onrender.com/api/pruebas/actual");

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("📊 Resultado de prueba activa:", result); // Para debug

            if (!result.success) {
                alert("No existe una prueba activa para editar");
                return onNavigate("gestionarpruebas");
            }

            setPruebaId(result.prueba._id);
            // Ahora cargamos los datos completos usando el endpoint por ID
            await cargarPruebaPorId(result.prueba._id);

        } catch (error) {
            console.error("Error cargando prueba activa:", error);
            alert("Error al conectar con el servidor: " + error.message);
            onNavigate("gestionarpruebas");
        }
    };

    const transformarDatosPrueba = (pruebaBackend) => {
        console.log("🔄 Transformando datos:", pruebaBackend); // Para debug

        if (!pruebaBackend || !pruebaBackend.preguntas) {
            console.error("❌ Datos de prueba inválidos:", pruebaBackend);
            alert("Error: Los datos de la prueba son inválidos");
            return;
        }

        const preguntasTransformadas = pruebaBackend.preguntas.map((p, index) => {
            // Encontrar el índice de la respuesta correcta
            const respuestaCorrectaIndex = p.opciones.findIndex(
                op => op.letra === p.respuestaCorrecta
            );

            console.log(`Pregunta ${index + 1}:`, {
                enunciado: p.enunciado,
                respuestaCorrecta: p.respuestaCorrecta,
                indiceEncontrado: respuestaCorrectaIndex,
                opciones: p.opciones.map(op => ({ letra: op.letra, texto: op.texto }))
            });

            return {
                pregunta: p.enunciado,
                opciones: p.opciones.map(op => op.texto),
                respuestaCorrecta: respuestaCorrectaIndex >= 0 ? respuestaCorrectaIndex : 0
            };
        });

        setPruebaData({
            preguntas: preguntasTransformadas
        });
    };

    // ==========================================
    // MANEJO DE INPUTS
    // ==========================================

    const handlePreguntaChange = (index, field, value) => {
        const nuevasPreguntas = [...pruebaData.preguntas];

        if (field === "pregunta") {
            nuevasPreguntas[index].pregunta = value;
        } else if (field.startsWith("opcion")) {
            const opIndex = parseInt(field.replace("opcion", ""));
            nuevasPreguntas[index].opciones[opIndex] = value;
        } else if (field === "respuestaCorrecta") {
            nuevasPreguntas[index].respuestaCorrecta = parseInt(value);
        }

        setPruebaData({ ...pruebaData, preguntas: nuevasPreguntas });
    };

    // ==========================================
    // VALIDACIÓN
    // ==========================================

    const validarFormulario = () => {
        for (let i = 0; i < pruebaData.preguntas.length; i++) {
            const p = pruebaData.preguntas[i];

            if (!p.pregunta.trim()) {
                alert(`La pregunta ${i + 1} no puede estar vacía`);
                return false;
            }

            for (let j = 0; j < p.opciones.length; j++) {
                if (!p.opciones[j].trim()) {
                    alert(`La opción ${String.fromCharCode(65 + j)} de la pregunta ${i + 1} no puede estar vacía`);
                    return false;
                }
            }

            if (p.respuestaCorrecta === undefined || p.respuestaCorrecta === null) {
                alert(`Debe seleccionar una respuesta correcta para la pregunta ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    // ==========================================
    // GUARDAR CAMBIOS
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        if (!pruebaId) {
            alert("Error: No se identificó la prueba a editar");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`https://cygnus-xjo4.onrender.com/api/pruebas/${pruebaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preguntas: pruebaData.preguntas
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                alert("✅ Prueba actualizada correctamente");
                onNavigate("gestionarpruebas");
            } else {
                alert("❌ Error: " + (result.message || "Error desconocido"));
            }

        } catch (error) {
            console.error("Error guardando prueba:", error);
            alert("❌ Error al guardar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const volverAGestion = () => onNavigate("gestionarpruebas");

    if (loading) {
        return (
            <div className="prueba-conocimiento-container">
                <div className="prueba-header">
                    <button className="back-btn" onClick={volverAGestion}>← Volver</button>
                    <h1 className="titulo-seccion">Editar Prueba Diagnóstica</h1>
                </div>
                <div className="loading">Cargando datos de la prueba...</div>
            </div>
        );
    }

    return (
        <div className="prueba-conocimiento-container">
            <div className="prueba-header">
                <button className="back-btn" onClick={volverAGestion}>← Volver</button>
                <h1 className="titulo-seccion">Editar Prueba Diagnóstica</h1>
            </div>

            <form onSubmit={handleSubmit} className="prueba-form">
                <div className="preguntas-container">
                    {pruebaData.preguntas.map((p, index) => (
                        <div key={index} className="pregunta-card">
                            <div className="pregunta-title">
                                <h3>Pregunta {index + 1}</h3>
                            </div>

                            <textarea
                                className="pregunta-textarea"
                                value={p.pregunta}
                                onChange={(e) => handlePreguntaChange(index, "pregunta", e.target.value)}
                                placeholder="Escribe el enunciado de la pregunta..."
                                rows={3}
                                required
                            />

                            <div className="opciones-container">
                                {p.opciones.map((op, opIndex) => (
                                    <div key={opIndex} className="opcion-item">
                                        <span className="opcion-letra">
                                            {String.fromCharCode(65 + opIndex)}
                                        </span>
                                        <input
                                            type="text"
                                            className="opcion-input"
                                            value={op}
                                            onChange={(e) =>
                                                handlePreguntaChange(index, `opcion${opIndex}`, e.target.value)
                                            }
                                            placeholder={`Texto de la opción ${String.fromCharCode(65 + opIndex)}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="respuesta-correcta-group">
                                <label>Respuesta correcta:</label>
                                <div className="opciones-radio">
                                    {p.opciones.map((_, opIndex) => (
                                        <label key={opIndex} className="radio-label">
                                            <input
                                                type="radio"
                                                name={`respuesta-${index}`}
                                                checked={p.respuestaCorrecta === opIndex}
                                                onChange={() =>
                                                    handlePreguntaChange(index, "respuestaCorrecta", opIndex)
                                                }
                                                required
                                            />
                                            <span>{String.fromCharCode(65 + opIndex)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-buttons-top">
                    <button
                        type="submit"
                        className={`btn-guardar ${saving ? 'btn-loading' : ''}`}
                        disabled={saving}
                    >
                        {!saving && "💾 "}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>

                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={volverAGestion}
                        disabled={saving}
                    >
                        ✕ Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}