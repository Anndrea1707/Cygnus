// Función para obtener recomendación basada en porcentaje de evaluación
export function obtenerRecomendacionPorcentual(porcentaje) {
    if (porcentaje >= 0 && porcentaje <= 10) {
        return {
            tipo: "repaso_intensivo",
            mensaje: "Te recomendamos repasar el tema completamente, recuerda que tenemos recursos que te pueden ayudar",
            bloqueoMinutos: 60,
            puedeAvanzar: false
        };
    } else if (porcentaje >= 11 && porcentaje <= 30) {
        return {
            tipo: "repaso_fuerte",
            mensaje: "Necesitas repasar los conceptos principales",
            bloqueoMinutos: 45,
            puedeAvanzar: false
        };
    } else if (porcentaje >= 31 && porcentaje <= 60) {
        return {
            tipo: "repaso_moderado",
            mensaje: "Un repaso te ayudará a mejorar",
            bloqueoMinutos: 30,
            puedeAvanzar: false
        };
    } else if (porcentaje >= 61 && porcentaje <= 69) {
        return {
            tipo: "repaso_leve",
            mensaje: "Estás cerca, un breve repaso te llevará al éxito",
            bloqueoMinutos: 15,
            puedeAvanzar: false
        };
    } else if (porcentaje >= 70 && porcentaje <= 85) {
        return {
            tipo: "felicitacion_repaso",
            mensaje: "¡Felicidades por aprobar! Te recomendamos un poco más de repaso para consolidar tu conocimiento",
            bloqueoMinutos: 0,
            puedeAvanzar: true
        };
    } else if (porcentaje >= 86 && porcentaje <= 100) {
        return {
            tipo: "felicitacion_excelente",
            mensaje: "¡Excelente desempeño! Has demostrado un gran dominio del tema",
            bloqueoMinutos: 0,
            puedeAvanzar: true
        };
    } else {
        return {
            tipo: "default",
            mensaje: "Continúa con tu aprendizaje",
            bloqueoMinutos: 0,
            puedeAvanzar: false
        };
    }
}

// Función para verificar si la evaluación está bloqueada
export function verificarBloqueoEvaluacion(ultimaActualizacion, minutosBloqueo) {
    if (!ultimaActualizacion || minutosBloqueo === 0) {
        return { bloqueado: false, tiempoRestante: 0 };
    }

    const ahora = new Date();
    const fechaUltimoIntento = new Date(ultimaActualizacion);
    const tiempoTranscurridoMs = ahora - fechaUltimoIntento;
    const tiempoTranscurridoMinutos = tiempoTranscurridoMs / (1000 * 60);
    const tiempoRestanteMinutos = Math.max(0, minutosBloqueo - tiempoTranscurridoMinutos);

    return {
        bloqueado: tiempoRestanteMinutos > 0,
        tiempoRestante: Math.ceil(tiempoRestanteMinutos)
    };
}

// Función original para recomendar cursos (mantenida)
export function recomendarCursos(cursos, usuario) {
    // ✅ Aplicar la regla de habilidad_nueva vs habilidad
    const habilidadActual = usuario.habilidad_nueva > 0 
        ? usuario.habilidad_nueva 
        : (usuario.prueba_conocimiento?.habilidad || 1);

    console.log("🔍 Habilidad calculada:", {
        habilidad_nueva: usuario.habilidad_nueva,
        habilidad_prueba: usuario.prueba_conocimiento?.habilidad,
        habilidad_actual: habilidadActual
    });

    // Determinar nivel recomendado basado en habilidad
    let nivelRecomendado;
    if (habilidadActual <= 2) {
        nivelRecomendado = "básico";
    } else if (habilidadActual <= 4) {
        nivelRecomendado = "intermedio";
    } else {
        nivelRecomendado = "avanzado";
    }

    // Filtrar cursos por nivel recomendado
    const cursosRecomendados = cursos.filter(curso => 
        curso.nivel.toLowerCase() === nivelRecomendado
    );

    return {
        habilidadActual,
        nivelRecomendado,
        cursosRecomendados: cursosRecomendados.slice(0, 3) // Limitar a 3 cursos
    };
}