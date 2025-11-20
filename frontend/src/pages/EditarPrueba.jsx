import React, { useState, useEffect } from "react";
import "./PruebaConocimiento.css"; // Reutilizamos los mismos estilos

export default function EditarPrueba({ onNavigate, pruebaId }) {
    const [pruebaData, setPruebaData] = useState({
        categoria: "",
        preguntas: Array(5).fill().map(() => ({
            pregunta: "",
            opciones: ["", "", "", ""],
            respuestaCorrecta: 0
        }))
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const categorias = [
        "matematicas",
        "tecnologia",
        "idiomas"
    ];

    useEffect(() => {
        cargarPrueba();
    }, [pruebaId]);

    const cargarPrueba = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/pruebas/${pruebaId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                // Transformar los datos del backend al formato del frontend
                const pruebaTransformada = {
                    categoria: result.data.categoria,
                    preguntas: result.data.preguntas.map(pregunta => ({
                        pregunta: pregunta.enunciado,
                        opciones: pregunta.opciones.map(opcion => opcion.texto),
                        respuestaCorrecta: pregunta.opciones.findIndex(op => op.letra === pregunta.respuestaCorrecta)
                    }))
                };
                setPruebaData(pruebaTransformada);
            } else {
                alert(`Error al cargar la prueba: ${result.message}`);
                onNavigate("gestionarpruebas");
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de conexión al cargar la prueba');
            onNavigate("gestionarpruebas");
        } finally {
            setLoading(false);
        }
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
            alert("Por favor selecciona una categoría");
            return;
        }

        for (let i = 0; i < pruebaData.preguntas.length; i++) {
            const pregunta = pruebaData.preguntas[i];
            if (!pregunta.pregunta.trim()) {
                alert(`La pregunta ${i + 1} no puede estar vacía`);
                return;
            }

            for (let j = 0; j < pregunta.opciones.length; j++) {
                if (!pregunta.opciones[j].trim()) {
                    alert(`La opción ${j + 1} de la pregunta ${i + 1} no puede estar vacía`);
                    return;
                }
            }

            const opcionesUnicas = new Set(pregunta.opciones.map(op => op.toLowerCase().trim()));
            if (opcionesUnicas.size !== pregunta.opciones.length) {
                alert(`La pregunta ${i + 1} tiene opciones repetidas`);
                return;
            }
        }

        try {
            setSaving(true);
            console.log('📤 Enviando datos actualizados al servidor:', pruebaData);

            const response = await fetch(`http://localhost:4000/api/pruebas/${pruebaId}`, {
                method: 'PUT',
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
                alert("✅ ¡Prueba actualizada exitosamente!");
                onNavigate("gestionarpruebas");
            } else {
                alert(`❌ Error al actualizar la prueba: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            alert('❌ Error de conexión al actualizar la prueba: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const volverAGestion = () => {
        onNavigate("gestionarpruebas");
    };

    if (loading) {
        return (
            <div className="prueba-conocimiento-container">
                <div className="prueba-header">
                    <button className="btn-volver" onClick={volverAGestion}>
                        ← Volver a Gestión
                    </button>
                    <h1>Editando Prueba</h1>
                </div>
                <div className="loading">Cargando prueba...</div>
            </div>
        );
    }

    return (
        <div className="prueba-conocimiento-container">
            {/* BOTÓN VOLVER */}
            <div className="prueba-header">
                <button className="btn-volver" onClick={volverAGestion}>
                    ← Volver a Gestión
                </button>
                <h1>Editar Prueba de Conocimiento</h1>
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
                    <button type="button" className="btn-cancelar" onClick={volverAGestion}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-crear" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}