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
// 🔹 Calcular P_acierto (Probabilidad de acierto)
// -------------------------------------------
function calcularPacierto(theta, dificultad) {
    return 1 / (1 + Math.exp(-(theta - dificultad)));
}

// -------------------------------------------
// 🔹 Calcular Score final (Fórmula principal)
// -------------------------------------------
function calcularScore(pacierto, nivelRecordacion, w1 = 0.7, w2 = 0.3) {
    return w1 * pacierto + w2 * (1 - nivelRecordacion);
}

// -------------------------------------------
// 🔹 Seleccionar preguntas por score más alto
// -------------------------------------------
function seleccionarPreguntasAdaptativas(preguntas, usuario, cantidad) {
    const preguntasConScore = preguntas.map(pregunta => {
        // Obtener habilidad del usuario (priorizar habilidad_nueva)
        const habilidad = usuario.habilidad_nueva > 0 ?
            usuario.habilidad_nueva : usuario.prueba_conocimiento.habilidad;

        // Obtener nivel de recordación (priorizar nivel_recordacion_nuevo)
        const recordacion = usuario.nivel_recordacion_nuevo > 0 ||
            usuario.nivel_recordacion_nuevo !== null ?
            usuario.nivel_recordacion_nuevo : usuario.nivel_recordacion;

        // Calcular P_acierto
        const pacierto = calcularPacierto(habilidad, pregunta.dificultad);

        // Calcular Score final
        const score = calcularScore(pacierto, recordacion, 0.7, 0.3);

        return {
            ...pregunta,
            score: score,
            pacierto: pacierto
        };
    });

    // Ordenar por score descendente
    preguntasConScore.sort((a, b) => b.score - a.score);

    // Seleccionar las mejores y luego mezclar aleatoriamente
    const mejoresPreguntas = preguntasConScore.slice(0, Math.min(cantidad * 2, preguntasConScore.length));

    // Mezclar aleatoriamente y tomar la cantidad solicitada
    return mezclarArray(mejoresPreguntas).slice(0, cantidad);
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
