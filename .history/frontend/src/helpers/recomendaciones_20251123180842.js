// helpers/recomendaciones.js

export function obtenerNivelRecomendado(habilidad) {
  if (habilidad >= 1 && habilidad <= 2.5) return "básico";
  if (habilidad >= 2.6 && habilidad <= 3.8) return "intermedio";
  if (habilidad >= 3.9 && habilidad <= 5) return "avanzado";
  return null;
}

// helpers/recomendaciones.js
export function recomendarCursos(cursos, usuario) {
  // ✅ Aplicar la regla de habilidad_nueva vs habilidad
  const habilidadActual = usuario.habilidad_nueva > 0 
    ? usuario.habilidad_nueva 
    : (usuario.prueba_conocimiento?.habilidad || 1);

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