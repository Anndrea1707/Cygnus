import React, { useEffect, useState } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./UsuariosAdmin.css";

const API_URL = "https://cygnus-xjo4.onrender.com/api/usuarios";

function GestionarAdmins({ onNavigate, onLogout, usuario, currentPage }) {
  const [admins, setAdmins] = useState([]);

  const [modal, setModal] = useState(null);
  // "crear" | "editar" | "eliminar" | null

  const [adminActual, setAdminActual] = useState({
    _id: "",
    nombre_completo: "",
    correo: "",
    rol: "admin",
  });

  /* ====================================================
                  CARGAR ADMINISTRADORES
  ====================================================== */
  useEffect(() => {
    cargarAdmins();
  }, []);

  const cargarAdmins = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const soloAdmins = data.filter((u) => u.rol === "admin");
      setAdmins(soloAdmins);
    } catch (error) {
      console.log("Error cargando administradores", error);
    }
  };

  /* ====================================================
                     CREAR / EDITAR ADMIN
  ====================================================== */
  const abrirCrear = () => {
    setAdminActual({
      _id: "",
      nombre_completo: "",
      correo: "",
      rol: "admin",
    });
    setModal("crear");
  };

  const abrirEditar = (admin) => {
    setAdminActual(admin);
    setModal("editar");
  };

  const manejarCambio = (e) => {
    setAdminActual({ ...adminActual, [e.target.name]: e.target.value });
  };

  const guardarAdmin = async () => {
    try {
      const metodo = modal === "editar" ? "PUT" : "POST";
      const url =
        modal === "editar"
          ? `${API_URL}/${adminActual._id}`
          : API_URL;

      await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminActual),
      });

      setModal(null);
      cargarAdmins();
    } catch (error) {
      console.log("Error guardando administrador:", error);
    }
  };

  /* ====================================================
                        ELIMINAR ADMIN
  ====================================================== */
  const abrirEliminar = (admin) => {
    setAdminActual(admin);
    setModal("eliminar");
  };

  const confirmarEliminar = async () => {
    try {
      await fetch(`${API_URL}/${adminActual._id}`, { method: "DELETE" });
      setModal(null);
      cargarAdmins();
    } catch (error) {
      console.log("Error eliminando admin", error);
    }
  };

  return (
    <div className="usuarios-admin">
      <NavbarPrincipal
        currentPage={currentPage}
        usuario={usuario}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="admin-content">
        <h1 className="titulo-admin">Gestión de Administradores</h1>
        <p className="descripcion-admin">
          Crea, edita o elimina administradores del sistema Cygnus.
        </p>

        <button className="btn-agregar" onClick={abrirCrear}>
          + Nuevo Administrador
        </button>

        {/* TABLA */}
        <div className="tabla-contenedor">
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a) => (
                <tr key={a._id}>
                  <td>{a.nombre_completo}</td>
                  <td>{a.correo}</td>

                  <td className="acciones">
                    <button className="btn-editar" onClick={() => abrirEditar(a)}>
                      Editar
                    </button>

                    <button className="btn-eliminar" onClick={() => abrirEliminar(a)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {admins.length === 0 && (
                <tr>
                  <td colSpan="3" className="no-registros">
                    No hay administradores registrados.
                  </td>
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
            <h2>{modal === "editar" ? "Editar Administrador" : "Nuevo Administrador"}</h2>

            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              value={adminActual.nombre_completo}
              onChange={manejarCambio}
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={adminActual.correo}
              onChange={manejarCambio}
            />

            <div className="modal-botones">
              <button className="btn-guardar" onClick={guardarAdmin}>
                Guardar
              </button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>
                Cancelar
              </button>
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
            <h2>¿Eliminar administrador?</h2>
            <p>
              Estás a punto de eliminar a <b>{adminActual.nombre_completo}</b>.
              <br />Esta acción no se puede deshacer.
            </p>

            <div className="modal-botones">
              <button className="btn-eliminar" onClick={confirmarEliminar}>
                Eliminar
              </button>
              <button className="btn-cerrar" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default GestionarAdmins;
