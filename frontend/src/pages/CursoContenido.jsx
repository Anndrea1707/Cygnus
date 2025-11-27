import React, { useState, useEffect } from "react";
import api from "../api/axios"; // 🔥 AGREGAR IMPORT
import "./CursoContenido.css";

export default function CursoContenido({
    curso,
    moduloIndex = 0,
    contenidoIndex = 0,
    onNavigate,
    onFinalizarCurso,
    forzarEvaluacionFinal
}) {
    const [moduloActual, setModuloActual] = useState(0);
    const [contenidoActual, setContenidoActual] = useState(0);
    const [mostrarConfirmacionEvaluacion, setMostrarConfirmacionEvaluacion] = useState(false);
    const [tipoEvaluacion, setTipoEvaluacion] = useState(null);

    const [progresoBackend, setProgresoBackend] = useState(null);
    const [cargandoProgresoBackend, setCargandoProgresoBackend] = useState(false);

    useEffect(() => {
        if (typeof moduloIndex === "number") {
            setModuloActual(moduloIndex);
        }
        if (typeof contenidoIndex === "number") {
            setContenidoActual(contenidoIndex);
        }
    }, [moduloIndex, contenidoIndex]);

    // Traer progreso backend
    useEffect(() => {
        const fetchProgresoBackend = async () => {
            try {
                const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
                const cursoId = curso?._id || curso?.id;
                if (!usuarioLS || !cursoId) return;

                setCargandoProgresoBackend(true);

                // 🔥 CORREGIR: Usar api en lugar de fetch
                const response = await api.get(`/api/progreso/curso/${usuarioLS._id}/${cursoId}`);
                const data = response.data;
                
                if (data.success && data.progreso) {
                    setProgresoBackend(data.progreso);
                } else {
                    setProgresoBackend(null);
                }
            } catch (error) {
                console.error("Error obteniendo progreso backend:", error);
                setProgresoBackend(null);
            } finally {
                setCargandoProgresoBackend(false);
            }
        };

        fetchProgresoBackend();
    }, [curso?._id, moduloActual, contenidoActual]);

    const modulo = curso?.modulos?.[moduloActual];
    const contenido = modulo?.contenido?.[contenidoActual];
    const esUltimoContenido = contenidoActual === (modulo?.contenido?.length - 1);
    const esUltimoModulo = moduloActual === (curso?.modulos?.length - 1);
    const hayEvaluacionModulo = modulo?.evaluacion?.preguntas?.length > 0;
    const hayEvaluacionFinal = curso?.evaluacionFinal?.preguntas?.length > 0;

    const obtenerTextoSiguiente = () => {
        if (esUltimoContenido) {
            if (esUltimoModulo) {
                if (hayEvaluacionFinal) {
                    return "Presentar evaluación final";
                } else {
                    return "Finalizar curso";
                }
            } else {
                if (hayEvaluacionModulo) {
                    return "Evaluación del módulo";
                } else {
                    return "Siguiente módulo";
                }
            }
        }
        return "Siguiente";
    };

    const guardarProgreso = async (mod = moduloActual, cont = contenidoActual) => {
        const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
        const cursoId = curso?._id || curso?.id;

        if (!usuarioLS || !cursoId) return;

        try {
            // 🔥 CORREGIR: Usar api en lugar de fetch
            const response = await api.post("/api/progreso/contenido-visto", {
                usuarioId: usuarioLS._id,
                cursoId,
                moduloIndex: mod,
                contenidoIndex: cont
            });

            const data = response.data;
            if (data.success) {
                console.log("Progreso guardado:", data.progreso);
            }
        } catch (error) {
            console.error("Error guardando progreso:", error);
        }
    };

    useEffect(() => {
        const navbar = document.querySelector(".navbar");
        const footer = document.querySelector(".footer");

        if (navbar) navbar.style.display = "none";
        if (footer) footer.style.display = "none";

        return () => {
            if (navbar) navbar.style.display = "flex";
            if (footer) footer.style.display = "block";
        };
    }, []);

    const verificarEvaluacionFinal = async () => {
        try {
            const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
            const cursoId = curso?._id || curso?.id;

            // 🔥 CORREGIR: Usar api en lugar de fetch
            const response = await api.get(`/api/progreso/puede-evaluacion-final/${usuarioLS._id}/${cursoId}/${curso.modulos.length}`);
            const data = response.data;

            if (data.success && data.puedeHacerEvaluacion) {
                setTipoEvaluacion("final");
                setMostrarConfirmacionEvaluacion(true);
            } else {
                if (esUltimoModulo) {
                    onFinalizarCurso?.();
                } else {
                    setModuloActual((prev) => prev + 1);
                    setContenidoActual(0);
                }
            }
        } catch (error) {
            console.error("Error verificando evaluación final:", error);

            if (esUltimoModulo) {
                onFinalizarCurso?.();
            } else {
                setModuloActual((prev) => prev + 1);
                setContenidoActual(0);
            }
        }
    };

    const handleSiguiente = async () => {
        await guardarProgreso();
        await guardarProgreso(moduloActual, contenidoActual);

        if (esUltimoContenido && hayEvaluacionModulo) {
            setTipoEvaluacion("modulo");
            setMostrarConfirmacionEvaluacion(true);
            return;
        }

        if (esUltimoContenido && esUltimoModulo && hayEvaluacionFinal) {
            setTipoEvaluacion("final");
            setMostrarConfirmacionEvaluacion(true);
            return;
        }

        if (esUltimoContenido && esUltimoModulo) {
            onFinalizarCurso?.();
            return;
        }

        if (esUltimoContenido) {
            setModuloActual((prev) => prev + 1);
            setContenidoActual(0);
            return;
        }

        setContenidoActual((prev) => prev + 1);
    };

    const handleAnterior = () => {
        if (contenidoActual === 0 && moduloActual > 0) {
            const moduloAnterior = moduloActual - 1;
            const ultimo = curso.modulos[moduloAnterior].contenido.length - 1;

            setModuloActual(moduloAnterior);
            setContenidoActual(ultimo);
        } else if (contenidoActual > 0) {
            setContenidoActual((prev) => prev - 1);
        }
    };

    const comenzarEvaluacion = () => {
        setMostrarConfirmacionEvaluacion(false);

        if (tipoEvaluacion === "modulo") {
            onNavigate("evaluacion-modulo", {
                curso,
                moduloIndex: moduloActual,
                modulo
            });
        } else {
            onNavigate("evaluacion-final", {
                curso,
                evaluacion: curso.evaluacionFinal
            });
        }
    };

    const saltarEvaluacion = () => {
        setMostrarConfirmacionEvaluacion(false);

        if (tipoEvaluacion === "modulo") {
            if (esUltimoModulo) {
                onFinalizarCurso?.();
            } else {
                setModuloActual((prev) => prev + 1);
                setContenidoActual(0);
            }
        } else {
            onFinalizarCurso?.();
        }
    };

    // --- PROGRESO CORREGIDO ---
    const calcularProgreso = () => {
        if (progresoBackend && typeof progresoBackend.progresoPorcentual === "number") {
            return Math.min(100, Math.max(0, Math.round(progresoBackend.progresoPorcentual)));
        }

        let vistosPrevios = 0;
        for (let i = 0; i < moduloActual; i++) {
            vistosPrevios += curso.modulos[i].contenido.length;
        }

        const vistos = vistosPrevios + contenidoActual + 1;
        const total = curso.modulos.reduce((acc, m) => acc + m.contenido.length, 0) || 1;

        let porcentaje = Math.round((vistos / total) * 100);

        if (hayEvaluacionFinal && porcentaje >= 100) {
            return 99;
        }

        return porcentaje;
    };

    const extraerYouTubeId = (url) => {
        if (!url) return null;
        const patrones = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
            /youtube\.com\/embed\/([^"&?\/\s]{11})/,
            /youtube\.com\/watch\?v=([^"&?\/\s]{11})/
        ];
        for (const patron of patrones) {
            const match = url.match(patron);
            if (match) return match[1];
        }
        return null;
    };

    const determinarTipoContenido = (contenido) => {
        if (!contenido) return 'desconocido';
        const url = contenido.contenido?.toLowerCase() || '';

        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('vimeo.com')) return 'vimeo';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'imagen';
        if (url.match(/\.(pdf)$/)) return 'pdf';
        if (url.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) return 'documento';
        if (url.startsWith('http')) return 'web';

        return 'desconocido';
    };

    const renderContenido = () => {
        if (!contenido || !contenido.contenido) {
            return (
                <div className="contenido-vacio">
                    <div className="contenido-vacio-icono">📚</div>
                    <h3>No hay contenido disponible</h3>
                </div>
            );
        }

        const tipo = determinarTipoContenido(contenido);
        const url = contenido.contenido;

        switch (tipo) {
            case 'youtube': {
                const videoId = extraerYouTubeId(url);
                if (!videoId) break;

                return (
                    <div className="contenido-video">
                        <div className="video-container">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                title={contenido.titulo}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                );
            }

            case 'vimeo': {
                const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                if (!vimeoId) break;

                return (
                    <div className="contenido-video">
                        <iframe
                            src={`https://player.vimeo.com/video/${vimeoId}`}
                            title={contenido.titulo}
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            }

            case 'imagen':
                return (
                    <div className="contenido-imagen">
                        <img src={url} alt={contenido.titulo} loading="lazy" />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="contenido-documento">
                        <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                            className="documento-iframe"
                        ></iframe>
                    </div>
                );

            case 'documento':
                return (
                    <div className="contenido-documento">
                        <p>Documento disponible:</p>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            Descargar archivo
                        </a>
                    </div>
                );

            case 'web':
                return (
                    <div className="contenido-web">
                        <iframe src={url} className="web-iframe" loading="lazy"></iframe>
                    </div>
                );

            default:
                return (
                    <div className="contenido-generico">
                        <p>Contenido no reconocido</p>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            Abrir contenido externo
                        </a>
                    </div>
                );
        }
    };

    if (!curso || !contenido) {
        return (
            <div className="curso-contenido-error">
                <h2>Error al cargar contenido</h2>
                <button onClick={() => onNavigate("curso-vista", { curso })}>
                    Volver al curso
                </button>
            </div>
        );
    }

    return (
        <div className="curso-contenido">
            <header className="contenido-header">
                <button onClick={() => onNavigate("curso-vista", { curso })}>
                    ← Volver al curso
                </button>

                <div className="progreso-info">
                    <span>Módulo {moduloActual + 1} de {curso.modulos.length}</span>
                    <span>Lección {contenidoActual + 1} de {modulo.contenido.length}</span>
                </div>
            </header>

            <main className="contenido-principal">
                <div className="contenido-visualizacion">
                    {renderContenido()}
                </div>

                <div className="contenido-informacion">
                    <h1>{contenido.titulo}</h1>
                    <p>{contenido.descripcion}</p>

                    <div className="modulo-info">
                        <h4>Información del módulo</h4>
                        <div className="modulo-item">
                            <span className="modulo-icon">📘</span>
                            <span className="modulo-text">{modulo.nombre}</span>
                        </div>
                        <div className="modulo-item">
                            <span className="modulo-icon">📝</span>
                            <span className="modulo-text">{modulo.descripcion}</span>
                        </div>
                        {hayEvaluacionModulo && (
                            <div className="modulo-item">
                                <span className="modulo-icon">✅</span>
                                <span className="modulo-text">{modulo.evaluacion.preguntas.length} preguntas</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Footer corregido --- */}
            <footer className="contenido-navegacion">
                <button
                    onClick={handleAnterior}
                    disabled={contenidoActual === 0 && moduloActual === 0}
                >
                    ← Anterior
                </button>

                <div className="progreso-footer">
                    <div className="progreso-texto">
                        Progreso: {calcularProgreso()}%
                    </div>
                    <div className="progreso-bar">
                        <div
                            className="progreso-fill"
                            style={{ width: `${calcularProgreso()}%` }}
                        ></div>

                        <div
                            className="progreso-indicador"
                            style={{ left: `${calcularProgreso()}%` }}
                        ></div>

                        <div className="progreso-meta"></div>
                    </div>
                </div>

                <button onClick={handleSiguiente}>
                    {obtenerTextoSiguiente()}
                </button>
            </footer>

            {mostrarConfirmacionEvaluacion && (
                <div className="modal-overlay">
                    <div className="modal-confirmacion">
                        <button className="modal-cerrar" onClick={() => setMostrarConfirmacionEvaluacion(false)}>×</button>

                        <h2>{tipoEvaluacion === "modulo" ? "Evaluación del módulo" : "Evaluación final"}</h2>
                        <p>
                            {tipoEvaluacion === "modulo"
                                ? `Vas a iniciar la evaluación del módulo "${modulo.nombre}".`
                                : `Vas a iniciar la evaluación final del curso "${curso.nombre}".`}
                        </p>
                        <div className="modal-actions">
                            <button className="btn-comenzar" onClick={comenzarEvaluacion}>
                                Comenzar evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}