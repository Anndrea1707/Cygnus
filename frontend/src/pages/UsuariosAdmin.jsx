import React, { useState, useEffect } from "react";
import api from "../api/axios"; // 🔥 AGREGAR IMPORT
import Navbar from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./UsuariosAdmin.css";

const UsuariosAdmin = ({ onNavigate, onLogout, usuario, currentPage }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState({
    _id: "",
    nombre_completo: "",
    correo: "",
    rol: "",
  });
  const [usuarioEncuesta, setUsuarioEncuesta] = useState(null);

  /* ====================================================
        FUNCIONES DE FECHA → tiempo relativo + exacto
  ====================================================== */

  function tiempoTranscurrido(fecha) {
    const ahora = new Date();
    const creada = new Date(fecha);
    const diff = ahora - creada;

    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(meses / 12);

    if (años > 0) return `hace ${años} año${años > 1 ? "s" : ""}`;
    if (meses > 0) return `hace ${meses} mes${meses > 1 ? "es" : ""}`;
    if (dias > 0) return `hace ${dias} día${dias > 1 ? "s" : ""}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;

    return "hace unos segundos";
  }

  function formatearFecha(fecha) {
    const opciones = { year: "numeric", month: "short", day: "numeric" };
    return new Date(fecha).toLocaleDateString("es-ES", opciones);
  }

  /* ====================================================
                    CARGAR USUARIOS
  ====================================================== */
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      // 🔥 CORREGIR: Usar api en lugar de fetch
      const res = await api.get("/api/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.log("Error cargando usuarios", error);
    }
  };

  /* ====================================================
                   CREAR / EDITAR
  ====================================================== */

  const abrirEditar = (u) => {
    setUsuarioActual(u);
    setModal("editar");
  };

  const manejarCambio = (e) => {
    setUsuarioActual({ ...usuarioActual, [e.target.name]: e.target.value });
  };

  const guardarUsuario = async () => {
    try {
      if (modal === "editar") {
        // 🔥 CORREGIR: Usar api en lugar de fetch
        await api.put(`/api/usuarios/${usuarioActual._id}`, usuarioActual);
      } else {
        // 🔥 CORREGIR: Usar api en lugar de fetch
        await api.post("/api/usuarios", usuarioActual);
      }

      setModal(null);
      cargarUsuarios();
    } catch (error) {
      console.log("Error guardando usuario:", error);
    }
  };

  /* ====================================================
                      ELIMINAR
  ====================================================== */
  const abrirEliminar = (u) => {
    setUsuarioActual(u);
    setModal("eliminar");
  };

  const confirmarEliminar = async () => {
    try {
      // 🔥 CORREGIR: Usar api en lugar de fetch
      await api.delete(`/api/usuarios/${usuarioActual._id}`);
      setModal(null);
      cargarUsuarios();
    } catch (error) {
      console.log("Error eliminando usuario", error);
    }
  };

  /* ====================================================
                   VER ENCUESTA
  ====================================================== */
  const abrirEncuesta = (u) => {
    setUsuarioEncuesta(u);
    setModal("verEncuesta");
  };

  return (
    <div className="usuarios-admin">
      <Navbar currentPage={currentPage} usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="admin-content">
        <h1 className="titulo-admin">Gestión de Usuarios</h1>
        <p className="descripcion-admin">
          Administra los usuarios registrados, revisa encuestas y controla accesos.
        </p>

        {/* TABLA */}
        <div className="tabla-contenedor">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u._id}>
                  <td>{u.nombre_completo}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>

                  {/* FECHA DE CREACIÓN */}
                  <td>
                    <div className="fecha-creacion">
                      <span className="relativo">{tiempoTranscurrido(u.creado_en)}</span>
                      <span className="fecha-exacta">{formatearFecha(u.creado_en)}</span>
                    </div>
                  </td>

                  <td className="acciones">
                    <button className="btn-editar" onClick={() => abrirEditar(u)}>Editar</button>
                    <button className="btn-ver" onClick={() => abrirEncuesta(u)}>Ver Encuesta</button>
                    <button className="btn-eliminar" onClick={() => abrirEliminar(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-registros">No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================
              MODAL CREAR / EDITAR
      ====================================================== */}
      {(modal === "crear" || modal === "editar") && (
        <div className="modal-fondo">
          <div className="modal glass">
            <h2>{modal === "editar" ? "Editar Usuario" : "Nuevo Usuario"}</h2>

            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              value={usuarioActual.nombre_completo}
              onChange={manejarCambio}
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={usuarioActual.correo}
              onChange={manejarCambio}
            />

            <select name="rol" value={usuarioActual.rol} onChange={manejarCambio}>
              <option value="">Seleccionar rol</option>
              <option value="estudiante">Estudiante</option>
              <option value="admin">Administrador</option>
            </select>

            <div className="modal-botones">
              <button className="btn-guardar" onClick={guardarUsuario}>Guardar</button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
                      MODAL ELIMINAR
      ====================================================== */}
      {modal === "eliminar" && (
        <div className="modal-fondo">
          <div className="modal glass modal-confirm">
            <h2>¿Eliminar usuario?</h2>
            <p>
              Estás a punto de eliminar a <b>{usuarioActual.nombre_completo}</b>.
              <br />Esta acción no se puede deshacer.
            </p>

            <div className="modal-botones">
              <button className="btn-eliminar" onClick={confirmarEliminar}>Eliminar</button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
                  MODAL VER ENCUESTA
      ====================================================== */}
      {modal === "verEncuesta" && usuarioEncuesta && (
        <div className="modal-fondo">
          <div className="modal glass encuesta-modal">
            <h2>Encuesta Inicial</h2>

            {!usuarioEncuesta.encuesta_inicial?.completada ? (
              <p className="no-encuesta">Este usuario aún no ha completado la encuesta.</p>
            ) : (
              <div className="encuesta-info">
                <p><b>Área de interés:</b> {usuarioEncuesta.encuesta_inicial.area_interes}</p>
                <p><b>Comodidad en el área:</b> {usuarioEncuesta.encuesta_inicial.comodidad_area}</p>
                <p><b>Estilo de aprendizaje:</b> {usuarioEncuesta.encuesta_inicial.estilo_aprendizaje}</p>
                <p><b>Tiempo de estudio:</b> {usuarioEncuesta.encuesta_inicial.tiempo_estudio}</p>
                <p><b>Objetivo:</b> {usuarioEncuesta.encuesta_inicial.objetivo}</p>
              </div>
            )}

            <button className="btn-cerrar" onClick={() => setModal(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UsuariosAdmin;