// helpers/recomendaciones.js
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

// ✅ NUEVA FUNCIÓN: Obtener recomendación según puntaje
export function obtenerRecomendacionPorPuntaje(puntaje, tipoEvaluacion = "módulo") {
  let mensaje = "";
  let bloqueoMinutos = 0;
  let aprobado = false;

  if (puntaje >= 0 && puntaje <= 10) {
    mensaje = `🔴 Necesitas repasar urgentemente este ${tipoEvaluacion}. Te recomendamos revisar los conceptos fundamentales.`;
    bloqueoMinutos = 60;
  } else if (puntaje >= 11 && puntaje <= 30) {
    mensaje = `🟡 Requieres repaso de este ${tipoEvaluacion}. Te sugerimos practicar más los ejercicios.`;
    bloqueoMinutos = 45;
  } else if (puntaje >= 31 && puntaje <= 60) {
    mensaje = `🟠 Estás cerca de aprobar este ${tipoEvaluacion}. Un repaso rápido te ayudará a mejorar.`;
    bloqueoMinutos = 30;
  } else if (puntaje >= 61 && puntaje <= 69) {
    mensaje = `🟢 Casi lo logras! Un pequeño repaso te llevará a la aprobación de este ${tipoEvaluacion}.`;
    bloqueoMinutos = 15;
  } else if (puntaje >= 70 && puntaje <= 85) {
    mensaje = `✅ ¡Felicidades! Has aprobado este ${tipoEvaluacion}. Te recomendamos seguir practicando para consolidar tu aprendizaje.`;
    aprobado = true;
  } else if (puntaje >= 86 && puntaje <= 100) {
    mensaje = `🎉 ¡Excelente trabajo! Dominas los conceptos de este ${tipoEvaluacion}. Sigue así.`;
    aprobado = true;
  }

  return {
    mensaje,
    bloqueoMinutos,
    aprobado,
    puntaje
  };
}

// ✅ NUEVA FUNCIÓN: Verificar si la evaluación está bloqueada
export function estaEvaluacionBloqueada(ultimaActualizacion, bloqueoMinutos) {
  if (!ultimaActualizacion || bloqueoMinutos === 0) {
    return false;
  }

  const ahora = new Date();
  const ultimaFecha = new Date(ultimaActualizacion);
  const diferenciaMs = ahora - ultimaFecha;
  const diferenciaMinutos = diferenciaMs / (1000 * 60);

  const estaBloqueado = diferenciaMinutos < bloqueoMinutos;
  
  if (estaBloqueado) {
    const minutosRestantes = Math.ceil(bloqueoMinutos - diferenciaMinutos);
    console.log(`⏰ Evaluación bloqueada. Tiempo restante: ${minutosRestantes} minutos`);
    return {
      bloqueado: true,
      minutosRestantes: minutosRestantes
    };
  }

  return {
    bloqueado: false,
    minutosRestantes: 0
  };
}