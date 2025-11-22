export const obtenerSesionesSemana = async (usuarioId) => {
  try {
    const resp = await fetch(`http://localhost:4000/api/sesiones/semana/${usuarioId}`);
    const data = await resp.json();

    if (!data.success) return [];

    return data.sesiones;
  } catch (error) {
    console.error("Error obteniendo sesiones:", error);
    return [];
  }
};
