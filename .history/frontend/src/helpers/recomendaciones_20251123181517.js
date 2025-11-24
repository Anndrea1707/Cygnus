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