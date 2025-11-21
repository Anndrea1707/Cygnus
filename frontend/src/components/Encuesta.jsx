import React, { useState } from "react";
import "./Encuesta.css";

function Encuesta({ usuario, onEncuestaCompletada }) {
  const [area, setArea] = useState("");
  const [meses, setMeses] = useState("");        // meses ingresados por el usuario
  const [olvido, setOlvido] = useState("");      // porcentaje (0-100)
  const [comodidad, setComodidad] = useState("");
  const [estilo, setEstilo] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const opcionesArea = ["matematicas", "tecnologia", "idiomas"];

  // Validación: todos los campos requeridos
  const formularioCompleto =
    area &&
    meses !== "" &&
    olvido !== "" &&
    comodidad &&
    estilo &&
    tiempo &&
    objetivo;

  // Función para cerrar modal (ARREGLA el ReferenceError)
  const cerrarModal = () => {
    setMostrarModal(false);
    // Si existe callback de finalización, lo llamamos
    if (typeof onEncuestaCompletada === "function") {
      onEncuestaCompletada();
    }
  };

  const guardarEncuesta = async () => {
    if (!formularioCompleto) return;

    // Validaciones mínimas y conversión segura
    const mesesNum = Number(meses);
    const olvidoNum = Number(olvido);

    const tiempoAnios = isFinite(mesesNum) ? mesesNum / 12 : null;
    const tasaOlvido = isFinite(olvidoNum) ? olvidoNum / 100 : null;

    try {
      const resp = await fetch(`/api/encuesta/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_interes: area,
          tiempo_area: tiempoAnios,     // guardamos en AÑOS
          tasa_olvido: tasaOlvido,      // guardamos en decimal 0-1
          comodidad_area: comodidad,
          estilo_aprendizaje: estilo,
          tiempo_estudio: tiempo,
          objetivo,
        }),
      });

      const result = await resp.json();

      if (resp.ok) {
        if (result.usuario) {
          localStorage.setItem("usuario", JSON.stringify(result.usuario));
        }
        setMostrarModal(true);
      } else {
        alert(result?.mensaje || "Error al guardar los datos");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <>
      <div className="encuesta-fondo">
        <div className="encuesta-card">
          <h2 className="encuesta-titulo">Personaliza tu experiencia</h2>

          {/* PREGUNTA 1 */}
          <div className="pregunta">
            <label>1. ¿Qué área te gustaría aprender primero?</label>
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Selecciona una opción</option>
              {opcionesArea.map((op, i) => (
                <option key={i} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* NUEVA: tiempo sin ver el tema (meses) */}
          {area && (
            <div className="pregunta">
              <label>
                2. ¿Hace cuánto NO ves o NO repasas el tema de <strong>{area}</strong>? (meses)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                placeholder="Ej: 6"
                value={meses}
                onChange={(e) => setMeses(e.target.value)}
                style={{
                  width: "80%",
                  maxWidth: "400px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid var(--color-primary)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  textAlign: "center",
                }}
              />
            </div>
          )}

          {/* NUEVA: porcentaje de olvido */}
          {area && meses !== "" && (
            <div className="pregunta">
              <label>
                3. ¿Qué tanto sientes que olvidaste del tema? (0% = recuerdo todo, 100% = olvidé todo)
              </label>
              <select value={olvido} onChange={(e) => setOlvido(e.target.value)}>
                <option value="">Selecciona un porcentaje</option>
                {[0,10,20,30,40,50,60,70,80,90,100].map((num) => (
                  <option key={num} value={num}>{num}%</option>
                ))}
              </select>
            </div>
          )}

          {/* Comodidad */}
          {area && (
            <div className="pregunta">
              <label>4. ¿Qué tan cómodo te sientes con <strong>{area}</strong>?</label>
              <select value={comodidad} onChange={(e) => setComodidad(e.target.value)}>
                <option value="">Selecciona una opción</option>
                <option>Me cuesta bastante</option>
                <option>A veces entiendo, a veces no</option>
                <option>Me va bien</option>
                <option>Me va excelente</option>
              </select>
            </div>
          )}

          {/* Resto */}
          <div className="pregunta">
            <label>5. ¿Cómo prefieres aprender?</label>
            <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Explicaciones paso a paso</option>
              <option>Ejercicios guiados</option>
              <option>Práctica rápida</option>
              <option>Retos avanzados</option>
            </select>
          </div>

          <div className="pregunta">
            <label>6. ¿Cuánto tiempo deseas estudiar por sesión?</label>
            <select value={tiempo} onChange={(e) => setTiempo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>10–15 minutos</option>
              <option>20–30 minutos</option>
              <option>40+ minutos</option>
            </select>
          </div>

          <div className="pregunta">
            <label>7. ¿Cuál es tu objetivo principal?</label>
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
            Guardar respuestas
          </button>
        </div>
      </div>

      {/* Modal */}
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
