import React, { useState, useEffect } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import fondoCursos from "../imagenes/fondoCursos.jpg";
import "./CursosUsuario.css";

export default function CursosUsuario({ currentPage, usuario, onNavigate, onLogout, onLoginClick }) {
    const [cursos, setCursos] = useState([]);
    const [modalCurso, setModalCurso] = useState(null);
    const [nivelFiltro, setNivelFiltro] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarCursos = async () => {
            try {
                setLoading(true);
const res = await fetch("https://cygnus-xjo4.onrender.com/api/cursos");
                const data = await res.json();
                const cursosNormalizados = data.map(curso => ({
                    ...curso,
                    id: curso._id || curso.id
                }));
                setCursos(cursosNormalizados);
            } catch (err) {
                console.error("Error al cargar cursos:", err);
            } finally {
                setLoading(false);
            }
        };
        cargarCursos();
    }, []);

    const niveles = ["Todos", "básico", "intermedio", "avanzado"];

    const cursosFiltrados = cursos.filter(curso => {
        const coincideNivel = nivelFiltro === "Todos" || curso.nivel === nivelFiltro;
        const coincideBusqueda = curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            curso.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        return coincideNivel && coincideBusqueda;
    });

    const CardCurso = ({ curso }) => (
        <div className="tarjeta-curso">
            <img src={curso.imagen} alt={curso.nombre} className="imagen-curso" />
            <div className="contenido-curso">
                <div className="curso-header">
                    <h3>{curso.nombre}</h3>
                    <span className={`etiqueta-nivel nivel-${curso.nivel?.toLowerCase()}`}>
                        {curso.nivel}
                    </span>
                </div>
                <p className="curso-descripcion">{curso.descripcion}</p>

                <div className="curso-meta">
                    <span className="meta-item">⏱️ {curso.horas || curso.horasEstimadas}h</span>
                    <span className="meta-item">📚 {curso.modulos?.length || 0} módulos</span>
                </div>

                <button
                    className="btn-detalles"
                    onClick={() => setModalCurso(curso)}
                >
                    Ver más
                </button>
            </div>
        </div>
    );

    const ModalCurso = ({ curso, onClose, onVerDetalles }) => {
        if (!curso) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-boton-cerrar" onClick={onClose}>Cerrar</button>


                    <div className="modal-header">
                        <img src={curso.imagen} alt={curso.nombre} className="modal-imagen" />
                        <div className="modal-info-basica">
                            <h2>{curso.nombre}</h2>
                            <span className={`etiqueta-nivel nivel-${curso.nivel?.toLowerCase()}`}>
                                {curso.nivel}
                            </span>
                        </div>
                    </div>

                    <div className="modal-body">
                        <p className="modal-descripcion">{curso.descripcion}</p>

                        <div className="modal-stats">
                            <div className="stat">
                                <strong>⏱️ Duración:</strong> {curso.horas || curso.horasEstimadas} horas
                            </div>
                            <div className="stat">
                                <strong>📚 Módulos:</strong> {curso.modulos?.length || 0}
                            </div>
                            <div className="stat">
                                <strong>🎯 Nivel:</strong> {curso.nivel}
                            </div>
                        </div>

                        {curso.modulos && curso.modulos.length > 0 && (
                            <div className="modal-modulos-preview">
                                <h4>Estructura del curso:</h4>
                                <ul>
                                    {curso.modulos.slice(0, 3).map((modulo, index) => (
                                        <li key={index}>
                                            <span className="modulo-indice">M{index + 1}</span>
                                            {modulo.nombre}
                                        </li>
                                    ))}
                                    {curso.modulos.length > 3 && (
                                        <li className="mas-modulos">
                                            +{curso.modulos.length - 3} módulos más...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        
                        <button
                            className="btn-primario"
                            onClick={() => onVerDetalles(curso)}
                        >
                            Ver detalles completos
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleVerDetallesCurso = (cursoSeleccionado) => {
        const cursoParaNavegar = {
            ...cursoSeleccionado,
            id: cursoSeleccionado._id || cursoSeleccionado.id
        };
        setModalCurso(null);
        onNavigate("curso-vista", { curso: cursoParaNavegar });
    };

    return (
        <div className="cursos-principal">
            <NavbarPrincipal
                currentPage={currentPage}
                usuario={usuario}
                onNavigate={onNavigate}
                onLogout={onLogout}
                onLoginClick={onLoginClick}
            />

            <section className="seccion-cursos">

                <div className="hero-cursos">
                    <div className="hero-text">
                        <h1 className="titulo-hero">Explora Nuestros Cursos</h1>
                        <p className="subtitulo-hero">
                            Aprende a tu propio ritmo con nuestra plataforma educativa
                        </p>
                    </div>

                </div>

                {/* Filtros: solo buscador con recuadro */}
                <div className="filtros-avanzados">
                    <div className="filtro-busqueda-fila">
                        <input
                            type="text"
                            placeholder="🔍 Buscar cursos por nombre..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input-busqueda"
                        />
                        <select
                            value={nivelFiltro}
                            onChange={(e) => setNivelFiltro(e.target.value)}
                            className="select-filtro-lado"
                        >
                            {niveles.map((nivel) => (
                                <option key={nivel} value={nivel}>
                                    {nivel === "Todos"
                                        ? "Todos los niveles"
                                        : nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <section className="seccion-todos-cursos">
                    <h2 className="titulo-seccion">
                        {nivelFiltro === "Todos" ? "Todos los cursos :" : `Cursos ${nivelFiltro}`}
                        <span className="contador-cursos-diseño">{cursosFiltrados.length}</span>
                    </h2>

                    {loading ? (
                        <div className="cargando">
                            <div className="spinner"></div>
                            <p>Cargando cursos...</p>
                        </div>
                    ) : cursosFiltrados.length === 0 ? (
                        <div className="sin-resultados">
                            <p>No se encontraron cursos con los filtros seleccionados.</p>
                            <button
                                className="btn-limpiar-filtros"
                                onClick={() => {
                                    setBusqueda("");
                                    setNivelFiltro("Todos");
                                }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid-cursos">
                            {cursosFiltrados.map(curso => (
                                <CardCurso key={curso._id} curso={curso} />
                            ))}
                        </div>
                    )}
                </section>
            </section>

            <Footer />

            {modalCurso && (
                <ModalCurso
                    curso={modalCurso}
                    onClose={() => setModalCurso(null)}
                    onVerDetalles={handleVerDetallesCurso}
                />
            )}
        </div>
    );
}
