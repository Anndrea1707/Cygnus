import React, { useState, useEffect } from "react";
import Navbar from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./CursosAdmin.css";

const API_URL = "http://localhost:4000/api/cursos";

const CursosAdmin = ({ onNavigate, onLogout, usuario, currentPage }) => {
    const [cursos, setCursos] = useState([]);
    const [busqueda, setBusqueda] = useState("");

    const [modal, setModal] = useState(null);
    const [cursoActual, setCursoActual] = useState({
        _id: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        imagen: "",
    });

    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCursos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error cargando cursos", error);
        }
    };

    const abrirCrear = () => {
        onNavigate("crearcursosadmin"); 
    };

    /* 
    ===========================================================
    ✅ FUNCIÓN CORREGIDA
    Ahora sí carga el curso COMPLETO para editarlo correctamente
    ===========================================================
    */
    const abrirEditar = async (curso) => {
        try {
            const res = await fetch(`${API_URL}/${curso._id}`);
            const cursoCompleto = await res.json();

            console.log("Curso completo para editar:", cursoCompleto);

            onNavigate("crearcursosadmin", cursoCompleto);
        } catch (error) {
            console.error("Error cargando curso para editar:", error);
            alert("No se pudo cargar el curso completo.");
        }
    };

    const abrirEliminar = (c) => {
        setCursoActual(c);
        setModal("eliminar");
    };

    const confirmarEliminar = async () => {
        try {
            await fetch(`${API_URL}/${cursoActual._id}`, { method: "DELETE" });
            setModal(null);
            cargarCursos();
        } catch (error) {
            console.log("Error eliminando curso", error);
        }
    };

    /** 📌 FILTRO SOLO POR BÚSQUEDA */
    const cursosFiltrados = cursos.filter((c) => {
        const busq = busqueda.toLowerCase();
        return (
            (c.nombre || "").toLowerCase().includes(busq) ||
            (c.descripcion || "").toLowerCase().includes(busq)
        );
    });

    return (
        <div className="cursos-admin">
            <Navbar
                currentPage={currentPage}
                usuario={usuario}
                onLogout={onLogout}
                onNavigate={onNavigate}
            />

            <div className="admin-content">
                <h1 className="titulo-admin">Gestión de Cursos</h1>
                <p className="descripcion-admin">
                    Administra los cursos activos, crea nuevos y organiza el contenido.
                </p>

                {/* 🔍 BUSCADOR + BOTÓN (ALINEADOS) */}
                <div className="filtros-container">
                    <input
                        type="text"
                        placeholder="Buscar curso por nombre o descripción..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="input-busqueda"
                    />

                    <button className="btn-agregar" onClick={abrirCrear}>
                        + Crear Curso
                    </button>
                </div>

                {/* GRID DE CURSOS */}
                <div className="grid-cursos">
                    {cursosFiltrados.map((c) => (
                        <div className="card-curso glass" key={c._id}>
                            <div className="img-curso">
                                <img src={c.imagen || "/img/placeholder.jpg"} alt={c.nombre} />
                            </div>

                            <h3>{c.nombre}</h3>
                            <p className="categoria">{c.categoria}</p>
                            <p className="descripcion">{c.descripcion}</p>

                            <div className="acciones-card">
                                <button
                                    className="btn-editar-admin"
                                    onClick={() => abrirEditar(c)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn-eliminar-admin"
                                    onClick={() => abrirEliminar(c)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}

                    {cursosFiltrados.length === 0 && (
                        <p className="no-registros">No hay cursos para mostrar.</p>
                    )}
                </div>
            </div>

            {/* MODAL ELIMINAR */}
            {modal === "eliminar" && (
                <div className="modal-fondo">
                    <div className="modal glass modal-confirm">
                        <h2>¿Eliminar curso?</h2>
                        <p>
                            Estás a punto de eliminar <b>{cursoActual.nombre}</b>.
                            <br />
                            Esta acción no se puede deshacer.
                        </p>

                        <div className="modal-botones">
                            <button
                                className="btn-eliminar-admin"
                                onClick={confirmarEliminar}
                            >
                                Eliminar
                            </button>
                            <button
                                className="btn-cerrar"
                                onClick={() => setModal(null)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CursosAdmin;
