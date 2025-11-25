import React, { useState } from "react";
import "./SoportePanel.css";
import { ChevronDown } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function SoportePanel({ onClose, tipoVista, setTipoVista, usuario }) {
    const [modo, setModo] = useState("faq"); // faq | pqrs

    const [formData, setFormData] = useState({
        nombre: usuario?.nombre_completo || usuario?.apodo || "",
        correo: usuario?.correo || "",
        tipo: "Petición",
        mensaje: "",
    });


    const [status, setStatus] = useState({ type: "", message: "" });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // ENVIAR PQRS
    const enviarPQRS = (e) => {
        e.preventDefault();

        if (
            !formData.nombre.trim() ||
            !formData.correo.trim() ||
            !formData.tipo.trim() ||
            !formData.mensaje.trim()
        ) {
            setStatus({
                type: "error",
                message: "Por favor completa todos los campos antes de enviar.",
            });
            return;
        }

        emailjs
            .send(
                "service_ta6ombs",
                "template_xy3jsvh",
                formData,
                "L1Myi6rqL0xde57_I"
            )
            .then(
                () => {
                    setStatus({
                        type: "success",
                        message: "Tu solicitud fue enviada correctamente.",
                    });

                    setFormData({
                        nombre: "",
                        correo: "",
                        tipo: "Petición",
                        mensaje: "",
                    });

                    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
                },
                () => {
                    setStatus({
                        type: "error",
                        message: "Error al enviar solicitud. Intenta nuevamente.",
                    });
                }
            );
    };

    const [activeIndex, setActiveIndex] = useState(null);
    const toggleFAQ = (i) => setActiveIndex(activeIndex === i ? null : i);

    const faqs = [
        {
            pregunta: '¿Por qué el enfoque inicial en matemáticas?',
            respuesta: 'Las matemáticas son fundamentales para el desarrollo del pensamiento lógico y representan una de las áreas con mayores dificultades de aprendizaje. Nuestro enfoque inicial nos permite perfeccionar los algoritmos de personalización y garantizar una experiencia de alta calidad antes de expandirnos a otras disciplinas académicas.'
        },
        {
            pregunta: "¿Cómo se adapta el contenido a mi nivel?",
            respuesta: "Nuestra plataforma utiliza un sistema inteligente que analiza tu desempeño en tiempo real. Basándonos en tus aciertos, tiempos de respuesta y patrones de aprendizaje, ajustamos automáticamente la dificultad de los ejercicios y recomendamos contenido específico para fortalecer tus áreas de oportunidad."
        },
        {
            pregunta: "¿Qué modelos de personalización utiliza Cygnus?",
            respuesta: "Implementamos dos modelos complementarios: el primero ajusta la dificultad del contenido según tu desempeño inmediato, y el segundo aplica la curva del olvido para programar repasos estratégicos en los momentos óptimos, maximizando tu retención a largo plazo."
        },
        {
            pregunta: "¿Cómo funciona el sistema de recompensas y copas?",
            respuesta: "Las copas son reconocimientos que obtienes al completar hitos significativos en tu aprendizaje. Inicialmente, funcionarán como logros visuales, pero en futuras actualizaciones planeamos convertirlas en un sistema de recompensas que permitirá desbloquear contenido exclusivo, personalizaciones de perfil y beneficios especiales dentro de la plataforma."
        },
        {
            pregunta: "¿Qué es la tabla de progreso semanal y cómo interpretarla?",
            respuesta: "La tabla de progreso semanal te muestra tu consistencia y evolución en el aprendizaje. Registra tus sesiones de estudio diarias, los temas revisados y tu rendimiento general. Las celdas coloreadas indican tu actividad: intensidad alta (verde), media (amarillo) o baja (rojo), ayudándote a mantener una rutina de estudio constante."
        },
        {
            pregunta: "¿Qué información muestran las gráficas de estadísticas?",
            respuesta: "Nuestras gráficas comparativas te ofrecen insights valiosos sobre tu aprendizaje: la gráfica de habilidad muestra tu dominio en diferentes temas matemáticos, mientras que la gráfica de nivel de recordación visualiza cuánto retienes de lo aprendido, permitiéndote identificar áreas que necesitan repaso y monitorear tu mejora continua."
        },
        {
            pregunta: "¿Los cursos tienen algún costo?",
            respuesta: "Actualmente, todos los cursos de Cygnus son completamente gratuitos. Creemos en el acceso democratizado a la educación de calidad y nos enfocamos en proporcionar una experiencia de aprendizaje excepcional sin barreras económicas para nuestros estudiantes."
        },
        {
            pregunta: "¿Puedo usar Cygnus en diferentes dispositivos?",
            respuesta: "Sí, Cygnus es una plataforma web responsive que se adapta a computadoras, tablets y smartphones. Tu progreso se sincroniza automáticamente entre dispositivos, permitiéndote continuar tu aprendizaje desde donde lo dejaste, en cualquier momento y lugar."
        }
    ];

    return (
        <>
            {/* === OVERLAY OSCURO (toda la pantalla) === */}
            <div className="soporte-overlay" onClick={onClose}></div>

            {/* === PANEL LATERAL === */}
            <div className="soporte-panel">
                <div className="panel-header">
                    <h3>Centro de Ayuda</h3>
                    <button className="cerrar-btn" onClick={onClose}>
                        ✖
                    </button>
                </div>

                {/* BOTONES SUPERIORES */}
                <div className="panel-tabs">
                    <button
                        className={modo === "faq" ? "active" : ""}
                        onClick={() => setModo("faq")}
                    >
                        Preguntas frecuentes
                    </button>

                    <button
                        className={modo === "pqrs" ? "active" : ""}
                        onClick={() => setModo("pqrs")}
                    >
                        PQRS
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="panel-content">
                    {/* === FAQ === */}
                    {modo === "faq" && (
                        <div className="faq-container">
                            {faqs.map((item, i) => (
                                <div key={i} className="faq-item">
                                    <div className="faq-question" onClick={() => toggleFAQ(i)}>
                                        <span>{item.pregunta}</span>
                                        <ChevronDown
                                            className={`icon ${activeIndex === i ? "rotate" : ""}`}
                                        />
                                    </div>

                                    <div
                                        className="faq-answer"
                                        style={{
                                            maxHeight: activeIndex === i ? "200px" : "0px",
                                        }}
                                    >
                                        <p>{item.respuesta}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* === PQRS === */}
                    {modo === "pqrs" && (
                        <form className="pqrs-form" onSubmit={enviarPQRS}>
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                            />

                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                            />

                            <label>Tipo</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange}>
                                <option>Petición</option>
                                <option>Queja</option>
                                <option>Reclamo</option>
                                <option>Sugerencia</option>
                            </select>

                            <label>Mensaje</label>
                            <textarea
                                name="mensaje"
                                rows="5"
                                value={formData.mensaje}
                                onChange={handleChange}
                            ></textarea>

                            {status.message && (
                                <div className={`form-status ${status.type}`}>
                                    {status.message}
                                </div>
                            )}

                            <button type="submit" className="btn-enviar">
                                Enviar
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
