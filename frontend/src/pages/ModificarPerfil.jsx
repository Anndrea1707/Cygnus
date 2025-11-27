import React, { useState, useEffect } from "react";
import api from "../api/axios";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "./ModificarPerfil.css";

function ModificarPerfil({ usuario, onLogout, onNavigate }) {
  const [nombre] = useState(usuario?.nombre_completo || "");
  const [apodo, setApodo] = useState(usuario?.apodo || "");
  const [correo, setCorreo] = useState(usuario?.correo || usuario?.email || "");
  const [avatarVista, setAvatarVista] = useState(usuario?.avatar || "/assets/avatars/avatar1.png");
  const [fondo, setFondo] = useState(usuario?.fondo || "/assets/fondos/fondo1.jpg");
  const [avataresDisponibles, setAvataresDisponibles] = useState({});
  const [fondosDisponibles, setFondosDisponibles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [seccion, setSeccion] = useState("general");

  // === Cargar avatares y fondos ===
  useEffect(() => {
    const fetchAvatares = async () => {
      try {
        const res = await api.get("/api/perfil/avatar");
        const data = res.data;
        const agrupados = data.reduce((acc, avatar) => {
          if (!acc[avatar.categoria]) acc[avatar.categoria] = [];
          acc[avatar.categoria].push(avatar.url);
          return acc;
        }, {});
        setAvataresDisponibles(agrupados);
      } catch (err) {
        console.error("Error cargando avatares:", err);
      }
    };

    const fetchFondos = async () => {
      try {
        const res = await api.get("/api/perfil/fondo");
        const data = res.data;
        setFondosDisponibles(data.map(f => f.url));
      } catch (err) {
        console.error("Error cargando fondos:", err);
      }
    };

    fetchAvatares();
    fetchFondos();
  }, []);

  // === Aplicar fondo al body ===
  useEffect(() => {
    if (fondo) {
      document.body.style.backgroundImage = `url(${fondo})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
    } else {
      document.body.style.backgroundImage = "";
    }

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, [fondo]);

  const descripciones = {
    general: "Modifica tus datos principales dentro de Cygnus. Solo el apodo y el correo pueden cambiarse.",
    avatar: "Selecciona tu avatar dentro de la galería oficial de Cygnus por categoría.",
    fondo: "Personaliza el fondo de tu perfil eligiendo entre estilos oficiales de Cygnus.",
    info: "Información importante sobre seguridad y políticas de tu cuenta en Cygnus.",
  };

  const abrirConfirmacion = () => setMostrarModal(true);
  const cancelarModal = () => setMostrarModal(false);

  // ================= GUARDAR CAMBIOS =================
  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const res = await api.post("/api/perfil/modificarPerfil", {
        id: usuario._id,
        nombre_completo: nombre,
        apodo,
        correo,
        avatar: avatarVista,
        fondo,
      });
      
      const data = res.data;
      if (data.ok) {
        const u = data.usuarioActualizado;
        localStorage.setItem("usuario", JSON.stringify(u));
        
        // ✅ CORREGIDO: Usar onNavigate en lugar de window.location.href
        onNavigate("perfil");
      } else {
        console.error("Error en la respuesta del servidor:", data);
      }
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setGuardando(false);
      setMostrarModal(false);
    }
  };

  // ✅ CORREGIDO: Función para volver al perfil usando onNavigate
  const volverAlPerfil = () => {
    onNavigate("perfil");
  };

  return (
    <>
      <NavbarPrincipal usuario={usuario} onLogout={onLogout} onNavigate={onNavigate} />

      <div className="editar-container">
        <button
          className="btn-volver-top"
          onClick={volverAlPerfil} // ✅ CORREGIDO
        >
          ← Volver al perfil
        </button>

        <div className="panel-lateral">
          {["general", "avatar", "fondo", "info"].map(sec => (
            <button
              key={sec}
              className={seccion === sec ? "opcion-lateral activa" : "opcion-lateral"}
              onClick={() => setSeccion(sec)}
            >
              {sec === "fondo" ? "Fondo del perfil" : sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
        </div>

        <div className="editar-contenido">
          <h1 className="titulo-seccion">{seccion.toUpperCase()}</h1>
          <p className="descripcion-seccion">{descripciones[seccion]}</p>

          {seccion === "general" && (
            <>
              <div className="campo">
                <label>Nombre completo</label>
                <input type="text" value={nombre} className="input-editar input-bonita" readOnly />
              </div>

              <div className="campo">
                <label>Apodo</label>
                <input
                  type="text"
                  value={apodo}
                  onChange={e => setApodo(e.target.value)}
                  className="input-editar input-bonita"
                />
              </div>

              <div className="campo">
                <label>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  className="input-editar input-bonita"
                />
              </div>
            </>
          )}

          {seccion === "avatar" && (
            <div className="galeria">
              {Object.keys(avataresDisponibles).map(categoria => (
                <div key={categoria}>
                  <h4 className="categoria-titulo">{categoria}</h4>
                  <div className="galeria-categoria">
                    {avataresDisponibles[categoria].map((url, idx) => (
                      <div
                        key={idx}
                        className={avatarVista.split("?")[0] === url ? "item-galeria seleccionado" : "item-galeria"}
                        onClick={() => setAvatarVista(`${url}?t=${Date.now()}`)}
                      >
                        <img src={url} alt="avatar" className="img-galeria" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {seccion === "fondo" && (
            <div className="galeria">
              {fondosDisponibles.map((url, idx) => (
                <div
                  key={idx}
                  className={fondo.split("?")[0] === url ? "item-galeria seleccionado" : "item-galeria"}
                  onClick={() => setFondo(`${url}?t=${Date.now()}`)}
                >
                  <img src={url} alt="fondo" className="img-galeria" />
                </div>
              ))}
            </div>
          )}

          {seccion === "info" && (
            <div className="info-seguridad">
              <div className="seguridad-contenido">
                <h3>🔒 Seguridad de tu Cuenta</h3>
                <div className="seguridad-item">
                  <strong>Protección de Datos</strong>
                  <p>Tus datos personales están encriptados y protegidos según los más altos estándares de seguridad.</p>
                </div>
                <div className="seguridad-item">
                  <strong>Privacidad Garantizada</strong>
                  <p>Nunca compartimos tu información personal con terceros sin tu consentimiento explícito.</p>
                </div>
                <div className="seguridad-item">
                  <strong>Contraseñas Seguras</strong>
                  <p>Utilizamos hash avanzado para almacenar tus contraseñas de forma completamente segura.</p>
                </div>
                <div className="seguridad-item">
                  <strong>Sesiones Controladas</strong>
                  <p>Las sesiones expiran automáticamente después de 24 horas para mayor seguridad.</p>
                </div>
                <div className="seguridad-item">
                  <strong>Verificación Requerida</strong>
                  <p>Tu correo electrónico debe estar verificado para acceder a todas las funciones.</p>
                </div>
                <div className="seguridad-item">
                  <strong>Control Total</strong>
                  <p>Puedes eliminar tu cuenta y todos tus datos personales en cualquier momento.</p>
                </div>
              </div>
            </div>
          )}

          {(seccion === "general" || seccion === "avatar" || seccion === "fondo") && (
            <div className="guardar-container">
              <button className="btn-guardar" onClick={abrirConfirmacion}>
                Guardar cambios
              </button>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>¿Guardar cambios?</h2>
            <p>Se actualizarán tus datos en Cygnus.</p>
            <div className="modal-buttons-vertical">
              <button className="btn-modal-cancelar" onClick={cancelarModal}>Cancelar</button>
              <button className="btn-modal-confirmar" onClick={guardarCambios} disabled={guardando}>
                {guardando ? "Guardando..." : "Confirmar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ModificarPerfil;