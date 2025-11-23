// helpers/recomendaciones.js

export function obtenerNivelRecomendado(habilidad) {
  if (habilidad >= 1 && habilidad <= 2.5) return "básico";
  if (habilidad >= 2.6 && habilidad <= 3.8) return "intermedio";
  if (habilidad >= 3.9 && habilidad <= 5) return "avanzado";
  return null;
}

export function recomendarCursos(cursos, usuario) {
  // RESPUESTA BASE SEGURA PARA EVITAR ERRORES
  const respuestaBase = {
    habilidadActual: 0,
    nivelRecomendado: null,
    cursosRecomendados: []
  };

  if (!usuario) return respuestaBase;

  // ✔ CAMBIO IMPORTANTE: se usa habilidad_nueva (exactamente como en la base de datos)
  const habilidad = usuario.habilidad_nueva > 0 
    ? usuario.habilidad_nueva 
    : usuario.habilidad;

  const nivelRecomendado = obtenerNivelRecomendado(habilidad);

  if (!nivelRecomendado) {
    return {
      ...respuestaBase,
      habilidadActual: habilidad
    };
  }

  const cursosRecomendados = cursos.filter(
    curso => curso.nivel?.toLowerCase() === nivelRecomendado.toLowerCase()
  );

  return {
    habilidadActual: habilidad,
    nivelRecomendado,
    cursosRecomendados
  };
}
