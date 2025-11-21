import React, { useState, useEffect } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./CursosUsuario.css";

export default function CursosUsuario({ currentPage, usuario, onNavigate, onLogout, onLoginClick }) {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

    // Traer cursos desde la API
    useEffect(() => {
        fetch("/api/cursos")
            .then(res => res.json())
            .then(data => setCursos(data))
            .catch(err => console.error("Error al cargar cursos:", err));
    }, []);

    const categorias = ["Todos", ...new Set(cursos.map(c => c.categoria))];
    const cursosFiltrados =
        categoriaFiltro === "Todos" ? cursos : cursos.filter(c => c.categoria === categoriaFiltro);

    // Detalle de curso
    if (cursoSeleccionado) {
        const handleEmpezar = () => {
            onNavigate("modulo", { cursoId: cursoSeleccionado._id, moduloIndex: 0 });
        };

        return (
            <div className="detalle-curso">
                <NavbarPrincipal
                    currentPage={currentPage}
                    usuario={usuario}
                    onNavigate={onNavigate}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                />

                <button className="btn-volver" onClick={() => setCursoSeleccionado(null)}>
                    ← Volver a cursos
                </button>

                <div className="detalle-contenido">
                    <img
                        src={cursoSeleccionado.imagen}
                        alt={cursoSeleccionado.nombre || cursoSeleccionado.titulo}
                        className="detalle-imagen"
                    />
                    <div className="detalle-info">
                        <h1>{cursoSeleccionado.nombre || cursoSeleccionado.titulo}</h1>
                        <p>{cursoSeleccionado.descripcion}</p>
                        <p><strong>Duración:</strong> {cursoSeleccionado.horas} horas</p>
                        <p><strong>Nivel:</strong> {cursoSeleccionado.nivel}</p>

                        {cursoSeleccionado.contenidos && cursoSeleccionado.contenidos.length > 0 && (
                            <div className="detalle-linea-tiempo">
                                <h3>Módulos del curso</h3>
                                <ul>
                                    {cursoSeleccionado.contenidos.map((m, i) => (
                                        <li key={i}>
                                            <span className="punto"></span>
                                            {m.nombre} {/* Aquí se evita el error de objeto */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            className="btn-login-detalles"
                            onClick={() => onNavigate("curso-vista", cursoSeleccionado)}
                        >
                            Ver más
                        </button>
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    // Lista de cursos
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
                <h2 className="titulo-seccion">Cursos disponibles</h2>

                <div className="filtro-categorias">
                    {categorias.map((cat) => (
                        <button
                            key={cat}
                            className={`btn-categoria ${categoriaFiltro === cat ? "activo" : ""}`}
                            onClick={() => setCategoriaFiltro(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid-cursos">
                    {cursosFiltrados.map((curso) => (
                        <div key={curso._id} className="tarjeta-curso">
                            <img src={curso.imagen} alt={curso.nombre || curso.titulo} className="imagen-curso" />
                            <div className="contenido-curso">
                                <h3>{curso.nombre || curso.titulo}</h3>
                                <p>{curso.descripcion}</p>
                                <span className="etiqueta-nivel">Nivel {curso.nivel}</span>
                                <button className="btn-detalles" onClick={() => setCursoSeleccionado(curso)}>
                                    Ver más
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
