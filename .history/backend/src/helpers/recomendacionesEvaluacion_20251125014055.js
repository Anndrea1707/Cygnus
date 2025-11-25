// backend/helpers/recomendacionesEvaluacion.js

// Función para obtener recomendación basada en porcentaje de evaluación
function obtenerRecomendacionPorcentual(porcentaje) {
    if (porcentaje >= 0 && porcentaje <= 10) {
        return {
            tipo: "repaso_intensivo",
            mensaje: "Te recomendamos repasar el tema completamente",
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
function verificarBloqueoEvaluacion(ultimaActualizacion, minutosBloqueo) {
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

module.exports = {
    obtenerRecomendacionPorcentual,
    verificarBloqueoEvaluacion
};