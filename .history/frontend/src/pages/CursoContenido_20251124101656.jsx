import React, { useState, useEffect } from "react";
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

    // 🚨 NUEVO: cuando CursoVista ordena evaluación final, bloquear contenido
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

    // Traer progreso backend
    useEffect(() => {
        const fetchProgresoBackend = async () => {
            try {
                const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
                const cursoId = curso?._id || curso?.id;
                if (!usuarioLS || !cursoId) return;

                setCargandoProgresoBackend(true);

                const resp = await fetch(
                    `http://localhost:4000/api/progreso/curso/${usuarioLS._id}/${cursoId}`
                );
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
            const response = await fetch("http://localhost:4000/api/progreso/contenido-visto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuarioLS._id,
                    cursoId,
                    moduloIndex: mod,
                    contenidoIndex: cont
                })
            });

            const data = await response.json();
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

            const response = await fetch(
                `http://localhost:4000/api/progreso/puede-evaluacion-final/${usuarioLS._id}/${cursoId}/${curso.modulos.length}`
            );

            const data = await response.json();

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
        // 🚨 si es evaluación final obligatoria, no avance contenido
        if (forzarEvaluacionFinal) {
            setTipoEvaluacion("final");
            setMostrarConfirmacionEvaluacion(true);
            return;
        }

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

