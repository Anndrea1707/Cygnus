// src/hooks/useProgresoCurso.js
import { useState, useEffect } from 'react';

export const useProgresoCurso = (cursoId, usuarioId) => {
    const [progreso, setProgreso] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarProgreso = async () => {
            if (!usuarioId || !cursoId) {
                setCargando(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:4000/api/progreso/curso/${usuarioId}/${cursoId}`);
                const data = await response.json();
                
                if (data.success) {
                    setProgreso(data.progreso);
                }
            } catch (error) {
                console.error("Error cargando progreso:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarProgreso();
    }, [cursoId, usuarioId]);

    const guardarProgresoContenido = async (moduloActual, contenidoActual, totalModulos, totalContenidosModulo) => {
        try {
            const response = await fetch("http://localhost:4000/api/progreso/contenido", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId,
                    cursoId,
                    moduloActual,
                    contenidoActual,
                    totalModulos,
                    totalContenidosModulo
                })
            });

            const data = await response.json();
            if (data.success) {
                setProgreso(data.progreso);
            }
        } catch (error) {
            console.error("Error guardando progreso:", error);
        }
    };

    return { progreso, cargando, guardarProgresoContenido };
};