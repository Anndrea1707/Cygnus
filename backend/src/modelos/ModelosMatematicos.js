// ===========================================
// 📘 MODELOS MATEMÁTICOS — SISTEMA ADAPTATIVO
// Archivo único centralizado
// Ubicación: backend/modelos/ModelosMatematicos.js
// ===========================================

// -------------------------------------------
// 🔹 Convertir meses → años
// -------------------------------------------
export function mesesAnios(meses) {
    return meses / 12;
}

// -------------------------------------------
// 🔹 Modelo logístico (habilidad vs dificultad)
// Fórmula:
//      P(acierto) = 1 / (1 + e^{-(θ - b)})
// -------------------------------------------
export function probabilidadAcierto(theta, dificultad) {
    return 1 / (1 + Math.exp(-(theta - dificultad)));
}

// -------------------------------------------
// 🔹 Curva de olvido (Ebbinghaus)
// Fórmula:
//      R(t) = e^{-λt}
// t = tiempo en AÑOS (por eso convertimos meses → años)
// λ = tasa de olvido del usuario
// -------------------------------------------
export function recuerdo(tiempoAnios, lambda) {
    return Math.exp(-lambda * tiempoAnios);
}

// -------------------------------------------
// 🔹 Score final combinado
// Combina memoria + habilidad
// Fórmula sugerida:
//      Score = w1·P(acierto) + w2·(1 - R)
// -------------------------------------------
export function scoreAprendizaje(probAcierto, recuerdo, w1 = 0.5, w2 = 0.5) {
    return w1 * probAcierto + w2 * (1 - recuerdo);
}

// -------------------------------------------
// 🔹 Función completa para calcular score
// CENTRALIZA TODAS LAS VARIABLES DEL USUARIO
// -------------------------------------------
export function calcularScoreCompleto({
    theta,
    dificultad,
    lambda,
    mesesDesdeUltimoRepaso,
    w1 = 0.5,
    w2 = 0.5,
}) {
    const t = mesesAnios(mesesDesdeUltimoRepaso);     // meses → años
    const p = probabilidadAcierto(theta, dificultad); // modelo logístico
    const r = recuerdo(t, lambda);                    // curva de olvido

    return scoreAprendizaje(p, r, w1, w2);            // escalar final
}

// -------------------------------------------
// 🔹 Exportación grupal opcional
// -------------------------------------------
export default {
    mesesAnios,
    probabilidadAcierto,
    recuerdo,
    scoreAprendizaje,
    calcularScoreCompleto
};
