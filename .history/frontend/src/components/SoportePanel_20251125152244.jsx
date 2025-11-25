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
      respuesta:
        'Decidimos enfocar nuestro lanzamiento en matemáticas porque es un área donde los estudiantes enfrentan mayores dificultades de aprendizaje y porque su naturaleza estructurada nos permite medir con precisión el progreso, refinar nuestros algoritmos de recomendación personalizada y garantizar una experiencia de alta calidad antes de expandirnos progresivamente a otras disciplinas, construyendo así una base sólida para convertirnos en la plataforma educativa integral que aspiramos ser.'
        },
        {
            pregunta: "¿Cómo funciona la adaptación del contenido?",
            respuesta:
                "La plataforma analiza tu progreso y ajusta la dificultad según tu desempeño...",
        },
        {
            pregunta: "¿Qué modelos matemáticos utiliza la plataforma?",
            respuesta:
                "Cygnus usa dos modelos sencillos para personalizar: uno ajusta dificultad y otro analiza el tiempo desde tu último estudio.",
        },
        {
            pregunta: "¿Cómo puedo registrarme o iniciar sesión?",
            respuesta:
                "Desde la página principal, selecciona Registrarse o Iniciar sesión y sigue los pasos.",
        },
        {
            pregunta: "¿Qué son las copas y cómo funcionan?",
            respuesta:
                "Las copas son recompensas al completar cursos. Permiten desbloquear contenido especial.",
        },
        {
            pregunta: "¿Puedo aprender sin conexión?",
            respuesta:
                "Por ahora no, pero estamos desarrollando una versión offline para el futuro.",
        },
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
