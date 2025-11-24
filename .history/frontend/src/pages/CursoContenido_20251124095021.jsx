import React, { useState, useEffect } from "react";
import "./CursoContenido.css";

export default function CursoContenido({ curso, moduloIndex = 0, contenidoIndex = 0, onNavigate, onFinalizarCurso, forzarEvaluacionFinal }) {
    const [moduloActual, setModuloActual] = useState(0);
    const [contenidoActual, setContenidoActual] = useState(0);
    const [mostrarConfirmacionEvaluacion, setMostrarConfirmacionEvaluacion] = useState(false);
    const [tipoEvaluacion, setTipoEvaluacion] = useState(null); // 'modulo' o 'final'

    // --- nuevo estado: progreso proveniente del backend ---
    const [progresoBackend, setProgresoBackend] = useState(null);
    const [cargandoProgresoBackend, setCargandoProgresoBackend] = useState(false);

    // Mostrar automáticamente la evaluación final cuando CursoVista lo ordena
    useEffect(() => {
        if (forzarEvaluacionFinal) {
            setTimeout(() => {
                setTipoEvaluacion("final");
                setMostrarConfirmacionEvaluacion(true);
            }, 200);
        }
    }, [forzarEvaluacionFinal]);

    useEffect(() => {
        if (typeof moduloIndex === "number") {
            setModuloActual(moduloIndex);
        }
        if (typeof contenidoIndex === "number") {
            setContenidoActual(contenidoIndex);
        }
    }, [moduloIndex, contenidoIndex]);

    // Nuevo: traer progreso del backend
    useEffect(() => {
        const fetchProgresoBackend = async () => {
            try {
                const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
                const cursoId = curso?._id || curso?.id;
                if (!usuarioLS || !cursoId) return;

                setCargandoProgresoBackend(true);

                const resp = await fetch(`http://localhost:4000/api/progreso/curso/${usuarioLS._id}/${cursoId}`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                const data = await resp.json();
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

    // Obtener el contenido actual
    const contenido = curso?.modulos?.[moduloActual]?.contenido?.[contenidoActual];
    const modulo = curso?.modulos?.[moduloActual];
    const esUltimoContenido = contenidoActual === (modulo?.contenido?.length - 1);
    const esUltimoModulo = moduloActual === (curso?.modulos?.length - 1);
    const hayEvaluacionModulo = modulo?.evaluacion && modulo.evaluacion.preguntas?.length > 0;
    const hayEvaluacionFinal = curso?.evaluacionFinal && curso.evaluacionFinal.preguntas?.length > 0;

    // Función corregida para determinar el texto del botón
    const obtenerTextoSiguiente = () => {
        if (esUltimoContenido) {
            if (esUltimoModulo) {
                if (hayEvaluacionFinal) {
                    return "Presentar evaluación módulo final";
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
        } else {
            return "Siguiente";
        }
    };

    const guardarProgreso = async (modulo = moduloActual, contenido = contenidoActual) => {
        const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
        const cursoId = curso?._id || curso?.id;

        if (!usuarioLS || !cursoId) return;

        try {
            const response = await fetch("http://localhost:4000/api/progreso/contenido-visto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuarioLS._id,
                    cursoId: cursoId,
                    moduloIndex: modulo,
                    contenidoIndex: contenido
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                console.log("✅ Progreso guardado:", data.progreso);
            }
        } catch (error) {
            console.error("❌ Error guardando progreso:", error);
        }
    };

    // Ocultar navbar y footer
    useEffect(() => {
        const navbar = document.querySelector('.navbar');
        const footer = document.querySelector('.footer');

        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';

        return () => {
            if (navbar) navbar.style.display = 'flex';
            if (footer) footer.style.display = 'block';
        };
    }, []);

    const verificarEvaluacionFinal = async () => {
        try {
            const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
            const cursoId = curso?._id || curso?.id;

            const response = await fetch(
                `http://localhost:4000/api/progreso/puede-evaluacion-final/${usuarioLS._id}/${cursoId}/${curso.modulos.length}`
            );

            if (!response.ok) {
                throw new Error('Error en la verificación');
            }

            const data = await response.json();

            if (data.success && data.puedeHacerEvaluacion) {
                setTipoEvaluacion('final');
                setMostrarConfirmacionEvaluacion(true);
            } else {
                if (esUltimoModulo) {
                    if (onFinalizarCurso) {
                        onFinalizarCurso();
                    }
                } else {
                    setModuloActual(prev => prev + 1);
                    setContenidoActual(0);
                }
            }
        } catch (error) {
            console.error("Error verificando evaluación final:", error);

            if (esUltimoModulo) {
                if (onFinalizarCurso) {
                    onFinalizarCurso();
                }
            } else {
                setModuloActual(prev => prev + 1);
                setContenidoActual(0);
            }
        }
    };

    const handleSiguiente = async () => {
        await guardarProgreso();
        await guardarProgreso(moduloActual, contenidoActual);

        if (esUltimoContenido && hayEvaluacionModulo) {
            setTipoEvaluacion('modulo');
            setMostrarConfirmacionEvaluacion(true);
            return;
        }

        if (esUltimoContenido && esUltimoModulo && hayEvaluacionFinal) {
            setTipoEvaluacion('final');
            setMostrarConfirmacionEvaluacion(true);
            return;
        }

        if (esUltimoContenido && esUltimoModulo) {
            if (onFinalizarCurso) {
                onFinalizarCurso();
            }
            return;
        }

        if (esUltimoContenido) {
            setModuloActual(prev => prev + 1);
            setContenidoActual(0);
            return;
        }

        setContenidoActual(prev => prev + 1);
    };

    const handleAnterior = () => {
        if (contenidoActual === 0 && moduloActual > 0) {
            const moduloAnterior = moduloActual - 1;
            const ultimoContenido = curso.modulos[moduloAnterior].contenido.length - 1;

            setModuloActual(moduloAnterior);
            setContenidoActual(ultimoContenido);
        } else if (contenidoActual > 0) {
            setContenidoActual(prev => prev - 1);
        }
    };

    const comenzarEvaluacion = () => {
        setMostrarConfirmacionEvaluacion(false);
        if (tipoEvaluacion === 'modulo') {
            onNavigate("evaluacion-modulo", {
                curso,
                moduloIndex: moduloActual,
                modulo: modulo
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

        if (tipoEvaluacion === 'modulo') {
            if (esUltimoModulo) {
                if (onFinalizarCurso) {
                    onFinalizarCurso();
                }
            } else {
                setModuloActual(prev => prev + 1);
                setContenidoActual(0);
            }
        } else {
            if (onFinalizarCurso) {
                onFinalizarCurso();
            }
        }
    };

    // *** NUEVA FUNCIÓN corregida: usa backend cuando exista ***
    const calcularProgreso = () => {
        if (progresoBackend && typeof progresoBackend.progresoPorcentual === "number") {
            return Math.min(100, Math.max(0, Math.round(progresoBackend.progresoPorcentual)));
        }

        let contenidosPrevios = 0;
        for (let i = 0; i < moduloActual; i++) {
            contenidosPrevios += curso.modulos[i].contenido.length;
        }

        const vistos = contenidosPrevios + contenidoActual + 1;

        const total = curso.modulos.reduce(
            (acc, m) => acc + m.contenido.length,
            0
        ) || 1;

        let porcentajeCalc = Math.round((vistos / total) * 100);

        const tieneEvaluacionFinal = curso?.evaluacionFinal?.preguntas?.length > 0;

        if (tieneEvaluacionFinal && porcentajeCalc >= 100) {
            return 99;
        }

        return porcentajeCalc;
    };

    // *** resto de tu archivo (SIN CAMBIOS) ***

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

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return 'youtube';
        }

        if (url.includes('vimeo.com')) {
            return 'vimeo';
        }

        if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
            return 'imagen';
        }

        if (url.match(/\.(pdf)$/)) {
            return 'pdf';
        }

        if (url.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/)) {
            return 'documento';
        }

        if (url.startsWith('http')) {
            return 'web';
        }

        return 'desconocido';
    };

    const renderContenido = () => {
        if (!contenido || !contenido.contenido) {
            return (
                <div className="contenido-vacio">
                    <div className="contenido-vacio-icono">📚</div>
                    <h3>No hay contenido disponible</h3>
                    <p>Esta lección no tiene contenido para mostrar.</p>
                </div>
            );
        }

        const tipo = determinarTipoContenido(contenido);
        const url = contenido.contenido;

        switch (tipo) {
            case 'youtube':
                const videoId = extraerYouTubeId(url);
                if (videoId) {
                    return (
                        <div className="contenido-video">
                            <div className="video-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                    title={contenido.titulo}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>
                            <div className="video-info">
                                <p>Reproduciendo video de YouTube</p>
                            </div>
                        </div>
                    );
                }
                break;

            case 'vimeo':
                const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                if (vimeoId) {
                    return (
                        <div className="contenido-video">
                            <div className="video-container">
                                <iframe
                                    src={`https://player.vimeo.com/video/${vimeoId}`}
                                    title={contenido.titulo}
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    );
                }
                break;

            case 'imagen':
                return (
                    <div className="contenido-imagen">
                        <div className="imagen-container">
                            <img
                                src={url}
                                alt={contenido.titulo}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="imagen-fallback" style={{ display: 'none' }}>
                                <p>No se pudo cargar la imagen</p>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    Abrir imagen en nueva pestaña
                                </a>
                            </div>
                        </div>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="contenido-documento">
                        <div className="documento-container">
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                title={contenido.titulo}
                                className="documento-iframe"
                                loading="lazy"
                            ></iframe>
                        </div>
                        <div className="documento-acciones">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-descargar"
                            >
                                📥 Descargar PDF
                            </a>
                        </div>
                    </div>
                );

            case 'documento':
                return (
                    <div className="contenido-documento">
                        <div className="documento-info">
                            <div className="documento-icono">📄</div>
                            <div className="documento-details">
                                <h4>Documento: {contenido.titulo}</h4>
                                <p>Este contenido es un documento descargable</p>
                            </div>
                        </div>
                        <div className="documento-acciones">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-descargar"
                            >
                                📥 Descargar documento
                            </a>
                        </div>
                    </div>
                );

            case 'web':
                return (
                    <div className="contenido-web">
                        <div className="web-container">
                            <iframe
                                src={url}
                                title={contenido.titulo}
                                className="web-iframe"
                                loading="lazy"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            ></iframe>
                        </div>
                        <div className="web-info">
                            <p>Contenido externo cargado desde: {new URL(url).hostname}</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="contenido-generico">
                        <div className="contenido-generico-icono">🔗</div>
                        <h4>Enlace externo</h4>
                        <p>Este contenido está disponible en un enlace externo:</p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-enlace-externo"
                        >
                            🌐 Abrir contenido externo
                        </a>
                    </div>
                );
        }

        return (
            <div className="contenido-generico">
                <div className="contenido-generico-icono">❓</div>
                <h4>Contenido no reconocido</h4>
                <p>No se pudo determinar el tipo de contenido.</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-enlace-externo"
                >
                    🔗 Intentar abrir enlace
                </a>
            </div>
        );
    };

    if (!curso || !contenido) {
        return (
            <div className="curso-contenido-error">
                <h2>Error al cargar el contenido</h2>
                <p>No se pudo encontrar el curso o el contenido solicitado.</p>
                <button
                    className="btn-volver-error"
                    onClick={() => onNavigate("curso-vista", { curso })}
                >
                    ← Volver al curso
                </button>
            </div>
        );
    }

    return (
        <div className="curso-contenido">
            <header className="contenido-header">
                <button
                    className="btn-volver-curso"
                    onClick={() => onNavigate("curso-vista", { curso })}
                >
                    ← Volver al curso
                </button>

                <div className="progreso-info">
                    <span className="modulo-actual">Módulo {moduloActual + 1} de {curso.modulos.length}</span>
                    <span className="leccion-actual">Lección {contenidoActual + 1} de {modulo.contenido.length}</span>
                </div>
            </header>

            <main className="contenido-principal">
                <div className="contenido-visualizacion">
                    {renderContenido()}
                </div>

                <div className="contenido-informacion">
                    <h1 className="contenido-titulo">{contenido.titulo}</h1>
                    <p className="contenido-descripcion">{contenido.descripcion}</p>

                    {contenido.recursoExtra && (
                        <div className="recursos-extra">
                            <h3>📎 Recursos adicionales</h3>
                            <div className="recurso-lista">
                                {contenido.recursoExtra.startsWith('http') ? (
                                    <a
                                        href={contenido.recursoExtra}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="recurso-item"
                                    >
                                        <span className="recurso-icono">🔗</span>
                                        <span className="recurso-texto">Enlace externo</span>
                                        <span className="recurso-descargar">📥</span>
                                    </a>
                                ) : (
                                    <div className="recurso-item">
                                        <span className="recurso-icono">📄</span>
                                        <span className="recurso-texto">{contenido.recursoExtra}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="modulo-info">
                        <h4>📂 Información del módulo</h4>
                        <p><strong>Módulo:</strong> {modulo.nombre}</p>
                        <p><strong>Descripción:</strong> {modulo.descripcion}</p>
                        {hayEvaluacionModulo && (
                            <p><strong>Evaluación:</strong> {modulo.evaluacion.preguntas.length} preguntas</p>
                        )}
                    </div>
                </div>
            </main>

            <footer className="contenido-navegacion">
                <button
                    className="btn-anterior"
                    onClick={handleAnterior}
                    disabled={contenidoActual === 0 && moduloActual === 0}
                >
                    ← Anterior
                </button>

                <div className="progreso-container">
                    <div className="progreso-texto">
                        Progreso: {moduloActual + 1}/{curso.modulos.length} módulos
                    </div>
                    <div className="progreso-bar">
                        <div
                            className="progreso-fill"
                            style={{ width: `${calcularProgreso()}%` }}
                        ></div>
                    </div>
                </div>

                <button
                    className="btn-siguiente"
                    onClick={handleSiguiente}
                >
                    {obtenerTextoSiguiente()}
                </button>
            </footer>

            {mostrarConfirmacionEvaluacion && (
                <div className="modal-overlay">
                    <div className="modal-confirmacion">
                        <div className="modal-header">
                            <h2>🎯 {tipoEvaluacion === 'modulo' ? 'Evaluación del Módulo' : 'Evaluación Final'}</h2>
                        </div>

                        <div className="modal-body">
                            <div className="evaluacion-info">
                                <p>
                                    {tipoEvaluacion === 'modulo'
                                        ? `Estás a punto de comenzar la evaluación del módulo "${modulo.nombre}".`
                                        : `Estás a punto de comenzar la evaluación final del curso "${curso.nombre}".`
                                    }
                                </p>

                                <div className="evaluacion-details">
                                    <div className="detail-item">
                                        <strong>⏱️ Duración estimada:</strong>
                                        <span>{tipoEvaluacion === 'modulo'
                                            ? `${modulo.evaluacion.preguntas.length * 2} minutos`
                                            : `${curso.evaluacionFinal.preguntas.length * 2} minutos`}</span>
                                    </div>

                                    <div className="detail-item">
                                        <strong>📝 Total de preguntas:</strong>
                                        <span>{tipoEvaluacion === 'modulo'
                                            ? modulo.evaluacion.preguntas.length
                                            : curso.evaluacionFinal.preguntas.length}</span>
                                    </div>

                                    <div className="detail-item">
                                        <strong>🎯 Objetivo:</strong>
                                        <span>{tipoEvaluacion === 'modulo'
                                            ? 'Evaluar tu comprensión del módulo'
                                            : 'Evaluar tu conocimiento general del curso'}</span>
                                    </div>
                                </div>

                                <div className="recomendaciones">
                                    <h4>📋 Recomendaciones:</h4>
                                    <ul>
                                        <li>• Asegúrate de tener un entorno tranquilo</li>
                                        <li>• Ten una conexión estable a internet</li>
                                        <li>• Lee cuidadosamente cada pregunta</li>
                                        <li>• No salgas de la evaluación una vez iniciada</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-comenzar"
                                onClick={comenzarEvaluacion}
                            >
                                🚀 Comenzar evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
