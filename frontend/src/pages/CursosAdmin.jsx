import React, { useState, useEffect } from "react";
import Navbar from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./CursosAdmin.css";

const API_URL = "/api/cursos";

const CursosAdmin = ({ onNavigate, onLogout, usuario, currentPage }) => {
  const [cursos, setCursos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modal, setModal] = useState(null); // "crear" | "editar" | "eliminar"
  const [cursoActual, setCursoActual] = useState({
    _id: "",
    titulo: "",
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
      setCursos(data);
    } catch (error) {
      console.log("Error cargando cursos", error);
    }
  };

  const abrirCrear = () => {
    setCursoActual({
      _id: "",
      titulo: "",
      descripcion: "",
      categoria: "",
      imagen: "",
    });
    setModal("crear");
  };

  const abrirEditar = (c) => {
    setCursoActual(c);
    setModal("editar");
  };

  const manejarCambio = (e) => {
    setCursoActual({ ...cursoActual, [e.target.name]: e.target.value });
  };

  const guardarCurso = async () => {
    try {
      const metodo = modal === "editar" ? "PUT" : "POST";
      const url = modal === "editar" ? `${API_URL}/${cursoActual._id}` : API_URL;

      await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cursoActual),
      });

      setModal(null);
      cargarCursos();
    } catch (error) {
      console.log("Error guardando curso:", error);
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

  // FILTRADO Y BUSQUEDA
  const cursosFiltrados = cursos.filter((c) => {
    const coincideBusqueda =
      c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro =
      filtro === "" || c.categoria.toLowerCase() === filtro.toLowerCase();

    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="cursos-admin">
      <Navbar currentPage={currentPage} usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="admin-content">
        <h1 className="titulo-admin">Gestión de Cursos</h1>
        <p className="descripcion-admin">
          Administra los cursos disponibles en la plataforma, crea, edita y organiza el contenido.
        </p>

        {/* 🔎 BÚSQUEDA + FILTROS */}
        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />

          <select
            className="select-filtro"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="programación">Programación</option>
            <option value="diseño">Diseño</option>
            <option value="matemáticas">Matemáticas</option>
          </select>

          <button className="btn-agregar" onClick={abrirCrear}>+ Nuevo Curso</button>
        </div>

        {/* GRID DE CURSOS */}
        <div className="grid-cursos">
          {cursosFiltrados.map((c) => (
            <div className="card-curso glass" key={c._id}>
              <div className="img-curso">
                <img src={c.imagen || "/img/placeholder.jpg"} alt={c.titulo} />
              </div>

              <h3>{c.titulo}</h3>
              <p className="categoria">{c.categoria}</p>
              <p className="descripcion">{c.descripcion}</p>

              <div className="acciones-card">
                <button className="btn-editar" onClick={() => abrirEditar(c)}>Editar</button>
                <button className="btn-eliminar" onClick={() => abrirEliminar(c)}>Eliminar</button>
              </div>
            </div>
          ))}

          {cursosFiltrados.length === 0 && (
            <p className="no-registros">No hay cursos para mostrar.</p>
          )}
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {(modal === "crear" || modal === "editar") && (
        <div className="modal-fondo">
          <div className="modal glass">
            <h2>{modal === "editar" ? "Editar Curso" : "Nuevo Curso"}</h2>

            <input
              type="text"
              name="titulo"
              placeholder="Título del curso"
              value={cursoActual.titulo}
              onChange={manejarCambio}
            />

            <input
              type="text"
              name="categoria"
              placeholder="Categoría"
              value={cursoActual.categoria}
              onChange={manejarCambio}
            />

            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={cursoActual.descripcion}
              onChange={manejarCambio}
              className="textarea"
            />

            <input
              type="text"
              name="imagen"
              placeholder="URL de imagen"
              value={cursoActual.imagen}
              onChange={manejarCambio}
            />

            <div className="modal-botones">
              <button className="btn-guardar" onClick={guardarCurso}>Guardar</button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modal === "eliminar" && (
        <div className="modal-fondo">
          <div className="modal glass modal-confirm">
            <h2>¿Eliminar curso?</h2>
            <p>
              Estás a punto de eliminar <b>{cursoActual.titulo}</b>.
              <br />Esta acción no se puede deshacer.
            </p>

            <div className="modal-botones">
              <button className="btn-eliminar" onClick={confirmarEliminar}>Eliminar</button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CursosAdmin;
