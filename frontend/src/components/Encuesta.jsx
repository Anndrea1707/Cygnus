import React, { useState } from "react";
import "./Encuesta.css";

function Encuesta({ usuario, onEncuestaCompletada }) {
  const [area, setArea] = useState("");
  const [comodidad, setComodidad] = useState("");
  const [estilo, setEstilo] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false); // ← NUEVO

  const opcionesArea = [
    "Matemáticas básicas",
    "Razonamiento lógico",
    "Retos",
    "Preparación escolar",
    "Otra",
  ];

  const formularioCompleto = area && comodidad && estilo && tiempo && objetivo;

  const guardarEncuesta = async () => {
    if (!formularioCompleto) return;

    try {
      const resp = await fetch(`/api/encuesta/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_interes: area,
          comodidad_area: comodidad,
          estilo_aprendizaje: estilo,
          tiempo_estudio: tiempo,
          objetivo,
        }),
      });

      if (resp.ok) {
        setMostrarModal(true); // ← Mostramos el modal bonito
      } else {
        alert("Error al guardar los datos");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    onEncuestaCompletada(); // Redirige al dashboard
  };

  return (
    <>
      <div className="encuesta-fondo">
        <div className="encuesta-card">
          <h2 className="encuesta-titulo">Personaliza tu experiencia</h2>

          {/* === TODAS TUS PREGUNTAS (igual que antes) === */}
          <div className="pregunta">
            <label>1. ¿Qué área te gustaría aprender primero?</label>
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Selecciona una opción</option>
              {opcionesArea.map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {area && (
            <div className="pregunta">
              <label>2. ¿Qué tan cómodo te sientes con <strong>{area}</strong>?</label>
              <select value={comodidad} onChange={(e) => setComodidad(e.target.value)}>
                <option value="">Selecciona una opción</option>
                <option>Me cuesta bastante</option>
                <option>A veces entiendo, a veces no</option>
                <option>Me va bien</option>
                <option>Me va excelente</option>
              </select>
            </div>
          )}

          <div className="pregunta">
            <label>3. ¿Cómo prefieres aprender?</label>
            <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Explicaciones paso a paso</option>
              <option>Ejercicios guiados</option>
              <option>Práctica rápida</option>
              <option>Retos avanzados</option>
            </select>
          </div>

          <div className="pregunta">
            <label>4. ¿Cuánto tiempo deseas estudiar por sesión?</label>
            <select value={tiempo} onChange={(e) => setTiempo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>10–15 minutos</option>
              <option>20–30 minutos</option>
              <option>40+ minutos</option>
            </select>
          </div>

          <div className="pregunta">
            <label>5. ¿Cuál es tu objetivo principal?</label>
            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Reforzar para el colegio</option>
              <option>Prepararme para exámenes</option>
              <option>Aprender desde cero</option>
              <option>Mejorar habilidades</option>
              <option>Otro</option>
            </select>
          </div>

          <button
            className="btn-guardar"
            onClick={guardarEncuesta}
            disabled={!formularioCompleto}
          >
            {formularioCompleto ? "Guardar respuestas" : "Completa todas las preguntas"}
          </button>
        </div>
      </div>

      {/* === MODAL DE ÉXITO (BONITO) === */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-exito">
            <div className="modal-icon">🎉</div>
            <h3>¡Encuesta completada con éxito!</h3>
            <p>Tu experiencia ya está personalizada. ¡Vamos a aprender!</p>
            <button className="modal-btn-aceptar" onClick={cerrarModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Encuesta;