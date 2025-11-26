import React, { useState } from "react";
import "./Encuesta.css";

// ========================================
// 🔧 URL REAL DEL BACKEND EN RENDER
// ========================================
const BASE_URL = "https://cygnus-xjo4.onrender.com";

function Encuesta({ usuario, onEncuestaCompletada }) {
  const [meses, setMeses] = useState("");
  const [olvido, setOlvido] = useState("");
  const [comodidad, setComodidad] = useState("");
  const [estilo, setEstilo] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const formularioCompleto =
    meses.trim() !== "" &&
    olvido.trim() !== "" &&
    comodidad.trim() !== "" &&
    estilo.trim() !== "" &&
    tiempo.trim() !== "" &&
    objetivo.trim() !== "";

  const cerrarModal = () => {
    setMostrarModal(false);
    if (typeof onEncuestaCompletada === "function") {
      onEncuestaCompletada();
    }
  };

  const guardarEncuesta = async () => {
    
    if (!formularioCompleto) return;

    
    const mesesNum = Number(meses);
    const olvidoNum = Number(olvido);

    const tiempo_meses = mesesNum;
    const tasa_olvido = olvidoNum / 100;

    try {
      const resp = await fetch(
        `${BASE_URL}/api/encuesta/usuario/${usuario._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            area_interes: "matematicas",
            tiempo_area: tiempo_meses,
            tasa_olvido: tasa_olvido,
            comodidad_area: comodidad,
            estilo_aprendizaje: estilo,
            tiempo_estudio: tiempo,
            objetivo,
          }),
        }
      );

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
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <>
      <div className="encuesta-fondo">
        <div className="encuesta-card">

          <h2 className="encuesta-titulo">Encuesta de Matemáticas</h2>

          <p className="encuesta-descripcion">
            Esta encuesta nos ayuda a conocer tu situación actual en matemáticas,
            para que podamos adaptar tu aprendizaje de forma personalizada.
          </p>

          {/* 1 */}
          <div className="pregunta">
            <label>1. ¿Hace cuánto NO ves o NO repasas matemáticas? (en meses)</label>

            <input
              type="number"
              min="0"
              max="120"
              className="input-numero"
              placeholder="Ej: 6"
              value={meses}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && Number(val) >= 0) {
                  setMeses(val);
                }
              }}
            />
          </div>

          {/* 2 */}
          <div className="pregunta">
            <label>2. ¿Qué tanto sientes que olvidaste los temas de matemáticas? (0% = nada, 100% = todo)</label>

            <select value={olvido} onChange={(e) => setOlvido(e.target.value)}>
              <option value="">Selecciona un porcentaje</option>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
                <option key={n} value={n}>{n}%</option>
              ))}
            </select>
          </div>

          {/* 3 */}
          <div className="pregunta">
            <label>3. ¿Qué tan cómodo te sientes con matemáticas?</label>

            <select value={comodidad} onChange={(e) => setComodidad(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Me cuesta bastante</option>
              <option>A veces entiendo, a veces no</option>
              <option>Me va bien</option>
              <option>Me va excelente</option>
            </select>
          </div>

          {/* 4 */}
          <div className="pregunta">
            <label>4. ¿Cómo prefieres aprender?</label>

            <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Explicaciones paso a paso</option>
              <option>Ejercicios guiados</option>
              <option>Práctica rápida</option>
              <option>Retos avanzados</option>
            </select>
          </div>

          {/* 5 */}
          <div className="pregunta">
            <label>5. ¿Cuánto tiempo deseas estudiar por sesión?</label>

            <select value={tiempo} onChange={(e) => setTiempo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>10–15 minutos</option>
              <option>20–30 minutos</option>
              <option>40+ minutos</option>
            </select>
          </div>

          {/* 6 */}
          <div className="pregunta">
            <label>6. ¿Cuál es tu objetivo principal?</label>

            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
              <option value="">Selecciona una opción</option>
              <option>Reforzar para mis estudios</option>
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

      {/* MODAL */}
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
