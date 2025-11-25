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

// En ModelosMatematicos.js - MODIFICAR la función:

// -------------------------------------------
// 🔹 Seleccionar preguntas por score más alto (CORREGIDA)
// -------------------------------------------
function seleccionarPreguntasAdaptativas(preguntas, usuario, cantidad) {
    console.log('🎯 Iniciando selección adaptativa para:', usuario.nombre_completo);
    console.log('📊 Parámetros usuario:', {
        habilidad_nueva: usuario.habilidad_nueva,
        habilidad: usuario.prueba_conocimiento?.habilidad,
        nivel_recordacion_nuevo: usuario.nivel_recordacion_nuevo,
        nivel_recordacion: usuario.nivel_recordacion
    });

    const preguntasConScore = preguntas.map((pregunta, index) => {
        // Obtener habilidad del usuario (priorizar habilidad_nueva)
        const habilidad = (usuario.habilidad_nueva > 0 || usuario.habilidad_nueva !== null) ?
            usuario.habilidad_nueva :
            (usuario.prueba_conocimiento?.habilidad || 1);

        // Obtener nivel de recordación (priorizar nivel_recordacion_nuevo)
        const recordacion = (usuario.nivel_recordacion_nuevo > 0 || usuario.nivel_recordacion_nuevo !== null) ?
            usuario.nivel_recordacion_nuevo :
            (usuario.nivel_recordacion || 0.5);

        console.log(`📝 Pregunta ${index + 1} - Dificultad: ${pregunta.dificultad}`);
        console.log(`   Habilidad usuario: ${habilidad}, Recordación: ${recordacion}`);

        // Calcular P_acierto
        const pacierto = calcularPacierto(habilidad, pregunta.dificultad);
        
        // Calcular Score final
        const score = calcularScore(pacierto, recordacion, 0.7, 0.3);

        console.log(`   P_acierto: ${pacierto.toFixed(4)}, Score: ${score.toFixed(4)}`);

        return {
            ...pregunta,
            _scoreCalculado: score,
            _paciertoCalculado: pacierto,
            _habilidadUsuario: habilidad,
            _recordacionUsuario: recordacion
        };
    });

    // Ordenar por score descendente (de mayor a menor)
    preguntasConScore.sort((a, b) => b._scoreCalculado - a._scoreCalculado);

    console.log('🏆 TOP 5 preguntas por score:');
    preguntasConScore.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. Score: ${p._scoreCalculado.toFixed(4)}, Dificultad: ${p.dificultad}`);
    });

    console.log('❌ PEORES 5 preguntas por score:');
    preguntasConScore.slice(-5).forEach((p, i) => {
        console.log(`   ${i + 1}. Score: ${p._scoreCalculado.toFixed(4)}, Dificultad: ${p.dificultad}`);
    });

    // ✅ CORRECCIÓN: Seleccionar EXACTAMENTE las mejores 'cantidad' preguntas
    // NO mezclar aleatoriamente - mantener el orden por score
    const preguntasSeleccionadas = preguntasConScore.slice(0, cantidad);

    console.log('✅ Selección final:');
    preguntasSeleccionadas.forEach((p, i) => {
        console.log(`   ${i + 1}. Score: ${p._scoreCalculado.toFixed(4)}, Dificultad: ${p.dificultad}`);
    });

    // ✅ LIMPIAR: Remover propiedades temporales antes de enviar al frontend
    const preguntasLimpias = preguntasSeleccionadas.map(pregunta => {
        const { 
            _scoreCalculado, 
            _paciertoCalculado, 
            _habilidadUsuario, 
            _recordacionUsuario, 
            ...preguntaLimpia 
        } = pregunta;
        return preguntaLimpia;
    });

    return preguntasLimpias;
}
// -------------------------------------------
// 🔹 Función para mezclar array (Fisher-Yates)
// -------------------------------------------
function mezclarArray(array) {
    const nuevoArray = [...array];
    for (let i = nuevoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
}

// Agregar al module.exports:
module.exports = {
    mesesAnios,
    probabilidadAcierto,
    recuerdo,
    scoreAprendizaje,
    calcularScoreCompleto,
    calcularPacierto,
    calcularScore,
    seleccionarPreguntasAdaptativas,
    mezclarArray
};
