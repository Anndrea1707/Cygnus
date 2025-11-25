// ===========================================
// 📘 MODELOS MATEMÁTICOS — SISTEMA ADAPTATIVO
// Archivo compatible con CommonJS
// ===========================================

// -------------------------------------------
// 🔹 Convertir meses → años
// -------------------------------------------
function mesesAnios(meses) {
    return meses / 12;
}

// -------------------------------------------
// 🔹 Modelo logístico
// -------------------------------------------
function probabilidadAcierto(theta, dificultad) {
    return 1 / (1 + Math.exp(-(theta - dificultad)));
}

// -------------------------------------------
// 🔹 Curva de olvido (Ebbinghaus)
// -------------------------------------------
function recuerdo(tiempoAnios, lambda) {
    return Math.exp(-lambda * tiempoAnios);
}

// -------------------------------------------
// 🔹 Score final combinado
// -------------------------------------------
function scoreAprendizaje(probAcierto, recuerdo, w1 = 0.5, w2 = 0.5) {
    return w1 * probAcierto + w2 * (1 - recuerdo);
}

// -------------------------------------------
// 🔹 Función completa para calcular score
// -------------------------------------------
function calcularScoreCompleto({
    theta,
    dificultad,
    lambda,
    mesesDesdeUltimoRepaso,
    w1 = 0.5,
    w2 = 0.5,
}) {
    const t = mesesAnios(mesesDesdeUltimoRepaso);  
    const p = probabilidadAcierto(theta, dificultad);
    const r = recuerdo(t, lambda);                   
    return scoreAprendizaje(p, r, w1, w2);
}

// -------------------------------------------
// 🔹 Exportación CommonJS
// -------------------------------------------
module.exports = {
    mesesAnios,
    probabilidadAcierto,
    recuerdo,
    scoreAprendizaje,
    calcularScoreCompleto
};
