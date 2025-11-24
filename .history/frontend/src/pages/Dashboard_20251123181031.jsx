function Dashboard({ usuario, onLogout, onNavigate }) {
  const [mostrarSoporte, setMostrarSoporte] = useState(false);
  const [cursosConProgreso, setCursosConProgreso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todosLosCursos, setTodosLosCursos] = useState([]);

  const nombreUsuario = usuario?.apodo || usuario?.nombre_completo || "Usuario";
  const [recomendaciones, setRecomendaciones] = useState(null);

  // ✅ VERIFICAR SI EL USUARIO DEBE COMPLETAR ENCUESTA O PRUEBA
  useEffect(() => {
    if (!usuario) return;

    // Si no ha completado la encuesta inicial, redirigir
    if (!usuario.encuesta_inicial?.completada) {
      onNavigate("encuesta-inicial");
      return;
    }

    // Si no ha completado la prueba diagnóstica, redirigir
    if (!usuario.prueba_conocimiento?.completada) {
      onNavigate("prueba-diagnostica");
      return;
    }
  }, [usuario, onNavigate]);

  // Cargar todos los cursos y el progreso del usuario
  useEffect(() => {
    const cargarDatos = async () => {
      // ✅ Agregar esta validación al inicio
      if (!usuario?._id || !usuario.prueba_conocimiento?.completada) return;

      try {
        setLoading(true);

        // 1. Cargar todos los cursos
        const responseCursos = await fetch("http://localhost:4000/api/cursos");
        const cursosData = await responseCursos.json();
        setTodosLosCursos(cursosData);

        // Generar recomendaciones basadas en habilidad
        const rec = recomendarCursos(cursosData, usuario);
        setRecomendaciones(rec);

        // 2. Para cada curso, verificar si hay progreso
        const cursosConProgresoArray = [];

        for (const curso of cursosData) {
          try {
            const responseProgreso = await fetch(
              `http://localhost:4000/api/progreso/curso/${usuario._id}/${curso._id}`
            );
            const progresoData = await responseProgreso.json();

            if (progresoData.success && progresoData.progreso) {
              cursosConProgresoArray.push({
                ...curso,
                progreso: progresoData.progreso
              });
            }
          } catch (error) {
            console.error(`Error cargando progreso para curso ${curso.nombre}:`, error);
          }
        }

        setCursosConProgreso(cursosConProgresoArray);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  // Función para continuar un curso
  const continuarCurso = (curso) => {
    onNavigate("curso-vista", { curso });
  };

  // Función para empezar un nuevo curso
  const verTodosLosCursos = () => {
    onNavigate("cursosusuario");
  };
  const TarjetaCursoRecomendado = ({ curso }) => (
    <div className="tarjeta-curso-progreso">
      <div className="curso-imagen-container">
        <img src={curso.imagen} alt={curso.nombre} className="curso-imagen" />
      </div>

      <div className="curso-contenido">
        <h3 className="curso-titulo">{curso.nombre}</h3>
        <p className="curso-descripcion">{curso.descripcion}</p>

        <div className="curso-info">
          <span className="curso-nivel">{curso.nivel}</span>
          <span className="curso-modulos">
            {curso.modulos?.length || 0} módulos
          </span>
        </div>

        <button
          className="btn-continuar-curso"
          onClick={() => onNavigate("curso-vista", { curso })}
        >
          🚀 Ver Curso
        </button>
      </div>
    </div>
  );

  // Componente de tarjeta de curso con progreso
  const TarjetaCursoProgreso = ({ curso }) => (
    <div className="tarjeta-curso-progreso">
      <div className="curso-imagen-container">
        <img src={curso.imagen} alt={curso.nombre} className="curso-imagen" />
        <div className="curso-progreso-badge">
          {Math.round(curso.progreso.progresoPorcentual)}%
        </div>
      </div>

      <div className="curso-contenido">
        <h3 className="curso-titulo">{curso.nombre}</h3>
        <p className="curso-descripcion">{curso.descripcion}</p>

        <div className="curso-info">
          <span className="curso-nivel">{curso.nivel}</span>
          <span className="curso-modulos">
            {curso.modulos?.length || 0} módulos
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="progreso-container">
          <div className="progreso-bar">
            <div
              className="progreso-fill"
              style={{ width: `${curso.progreso.progresoPorcentual}%` }}
            ></div>
          </div>
          <span className="progreso-texto">
            {Math.round(curso.progreso.progresoPorcentual)}% completado
          </span>
        </div>

        {/* Información detallada del progreso */}
        <div className="progreso-detalles">
          <div className="progreso-item">
            <span className="progreso-label">Módulo actual:</span>
            <span className="progreso-valor">
              {curso.progreso.moduloActual + 1} de {curso.modulos?.length || 0}
            </span>
          </div>

          {curso.progreso.modulosCompletados && curso.progreso.modulosCompletados.length > 0 && (
            <div className="progreso-item">
              <span className="progreso-label">Módulos completados:</span>
              <span className="progreso-valor">
                {curso.progreso.modulosCompletados.length}
              </span>
            </div>
          )}

          {curso.progreso.evaluacionFinalCompletada && (
            <div className="progreso-item completado">
              <span className="progreso-label">✅ Evaluación final:</span>
              <span className="progreso-valor">Completada</span>
            </div>
          )}
        </div>

        <button
          className="btn-continuar-curso"
          onClick={() => continuarCurso(curso)}
        >
          {curso.progreso.progresoPorcentual >= 100 ? '🎉 Ver Curso Completado' : '🚀 Continuar Curso'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-background">
      <NavbarPrincipal
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage="dashboard"
      />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>🌟 Bienvenido, {nombreUsuario} 🌟</h2>
          <p>
            Nos alegra tenerte aquí. Desde este panel podrás acceder a todas tus
            herramientas y secciones de Cygnus.
          </p>
        </div>
        {/* Sección de recomendaciones personalizadas */}
        {recomendaciones && (
          <section className="recomendaciones-section">
            <div className="section-header">
              <h3>🌟 Recomendación Personalizada</h3>

              <p>
                Tu habilidad actual es:
                <strong> {recomendaciones.habilidadActual}</strong>
              </p>

              <p>
                Te recomendamos cursos de nivel:
                <strong> {recomendaciones.nivelRecomendado}</strong>
              </p>

              <p className="recomendacion-texto-extra">
                Basado en tu habilidad, estos cursos son ideales para tu nivel de aprendizaje:
              </p>
            </div>

            {recomendaciones.cursosRecomendados?.length > 0 ? (
              <div className="grid-cursos-progreso">
                {recomendaciones.cursosRecomendados.map(curso => (
                  <TarjetaCursoRecomendado key={curso._id} curso={curso} />
                ))}
              </div>
            ) : (
              <p>No encontramos cursos compatibles con tu habilidad actual.</p>
            )}
          </section>
        )}


        {/* Sección de cursos con progreso */}
        <section className="cursos-progreso-section">
          <div className="section-header">
            <h3>📚 Tus Cursos en Progreso</h3>
            <p>Continúa donde lo dejaste o revisa tus cursos completados</p>
          </div>

          {loading ? (
            <div className="cargando-cursos">
              <div className="spinner"></div>
              <p>Cargando tus cursos...</p>
            </div>
          ) : cursosConProgreso.length > 0 ? (
            <div className="grid-cursos-progreso">
              {cursosConProgreso.map(curso => (
                <TarjetaCursoProgreso key={curso._id} curso={curso} />
              ))}
            </div>
          ) : (
            <div className="sin-cursos-progreso">
              <div className="sin-cursos-icono">📚</div>
              <h4>Aún no tienes cursos en progreso</h4>
              <p>¡Comienza tu primer curso y empieza tu journey de aprendizaje!</p>
              <button
                className="btn-empezar-cursos"
                onClick={verTodosLosCursos}
              >
                🚀 Explorar Cursos Disponibles
              </button>
            </div>
          )}

          {/* Botón para ver todos los cursos */}
          {cursosConProgreso.length > 0 && (
            <div className="ver-todos-cursos">
              <button
                className="btn-ver-todos"
                onClick={verTodosLosCursos}
              >
                📖 Ver Todos los Cursos Disponibles
              </button>
            </div>
          )}
        </section>

        {/* Estadísticas rápidas */}
        {cursosConProgreso.length > 0 && (
          <section className="estadisticas-rapidas">
            <h3>📊 Tu Progreso General</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <span className="stat-number">{cursosConProgreso.length}</span>
                  <span className="stat-label">Cursos activos</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {cursosConProgreso.filter(curso => curso.progreso.progresoPorcentual >= 100).length}
                  </span>
                  <span className="stat-label">Cursos completados</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {Math.round(
                      cursosConProgreso.reduce((acc, curso) => acc + curso.progreso.progresoPorcentual, 0) /
                      Math.max(cursosConProgreso.length, 1)
                    )}%
                  </span>
                  <span className="stat-label">Progreso promedio</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {cursosConProgreso.filter(curso =>
                      curso.progreso.progresoPorcentual > 0 &&
                      curso.progreso.progresoPorcentual < 100
                    ).length}
                  </span>
                  <span className="stat-label">En progreso</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* === BOTÓN FLOTANTE DE AYUDA === */}
      <button className="btn-ayuda-flotante" onClick={() => setMostrarSoporte(true)}>
        <img
          src="https://cdn-icons-png.flaticon.com/128/5726/5726775.png"
          alt="soporte"
        />
      </button>

      {/* === PANEL LATERAL DE AYUDA === */}
      {mostrarSoporte && (
        <SoportePanel
          onClose={() => setMostrarSoporte(false)}
          usuario={usuario}
        />
      )}

      <Footer />
    </div>
  );
}

export default Dashboard;