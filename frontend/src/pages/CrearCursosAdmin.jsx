import React, { useState } from "react";
import axios from "axios";
import "./CrearCursosAdmin.css";

const CrearCursosAdmin = ({ onNavigate }) => {
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        horas: "",
        nivel: "",
        categoria: "",
        imagen: "",
    });

    const [imagenPreview, setImagenPreview] = useState(null);
    const [modalModulo, setModalModulo] = useState(false);
    const [modulos, setModulos] = useState([]);
    const [nuevoModulo, setNuevoModulo] = useState({ nombre: "" });

    const manejarCambio = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const subirImagen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagenPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("imagen", file);

        try {
            const res = await axios.post("http://localhost:4000/api/cursos/upload", formData);
            setForm({ ...form, imagen: res.data.url });
        } catch (error) {
            alert("Error al subir la imagen");
        }
    };

    const guardarModulo = () => {
        if (!nuevoModulo.nombre.trim()) return;
        setModulos([...modulos, { nombre: nuevoModulo.nombre.trim() }]);
        setNuevoModulo({ nombre: "" });
        setModalModulo(false);
    };

    const crearCurso = async () => {
        const data = { ...form, modulos };
        try {
            await axios.post("http://localhost:4000/api/cursos", data);
            alert("¡Curso creado exitosamente!");
            onNavigate("cursosadmin"); // vuelve a la página de cursos
        } catch (error) {
            alert("Error al crear el curso");
        }
    };

    return (
        <div className="crear-curso-page">
            <button className="back-btn" onClick={() => onNavigate("cursosadmin")}>
                ← Volver a Cursos
            </button>
            <div className="form-card">
                <h1 className="titulo-principal">Crear Nuevo Curso</h1>
                <p className="subtitulo">Completa todos los campos para registrar un nuevo curso</p>

                <div className="form-grid">
                    <div className="input-group">
                        <label>Nombre del curso</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={manejarCambio}
                            placeholder="Ej: Fundamentos de Álgebra"
                        />
                    </div>

                    <div className="input-group">
                        <label>Horas estimadas</label>
                        <input
                            type="number"
                            name="horas"
                            value={form.horas}
                            onChange={manejarCambio}
                            placeholder="40"
                        />
                    </div>

                    <div className="input-group">
                        <label>Nivel</label>
                        <select name="nivel" value={form.nivel} onChange={manejarCambio}>
                            <option value="">Seleccionar nivel</option>
                            <option value="básico">Básico</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="alto">Avanzado</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Categoría</label>
                        <select name="categoria" value={form.categoria} onChange={manejarCambio}>
                            <option value="">Seleccionar categoría</option>
                            <option value="Matemáticas">Matemáticas</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Idiomas">Idiomas</option>
                        </select>
                    </div>

                    <div className="input-group full">
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={manejarCambio}
                            rows="5"
                            placeholder="Explica de qué trata el curso..."
                        />
                    </div>

                    <div className="input-group full">
                        <label>Imagen del curso</label>
                        <input type="file" accept="image/*" onChange={subirImagen} />
                        {imagenPreview && <img src={imagenPreview} alt="Vista previa" className="imagen-preview" />}
                    </div>
                </div>

                <div className="modulos-section">
                    <button className="btn-agregar-modulo" onClick={() => setModalModulo(true)}>
                        + Agregar Módulo
                    </button>

                    <div className="modulos-lista">
                        {modulos.length === 0 ? (
                            <p className="sin-modulos">Aún no has agregado módulos</p>
                        ) : (
                            modulos.map((modulo, index) => (
                                <div key={index} className="modulo-tag">
                                    {modulo.nombre}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <button className="btn-crear-curso" onClick={crearCurso}>
                    Crear Curso
                </button>

            </div>

            {modalModulo && (
                <div className="backdrop">
                    <div className="modal-card">
                        <h2>Nuevo Módulo</h2>
                        <input
                            type="text"
                            placeholder="Nombre del módulo"
                            value={nuevoModulo.nombre}
                            onChange={(e) => setNuevoModulo({ nombre: e.target.value })}
                        />
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModalModulo(false)}>
                                Cancelar
                            </button>
                            <button className="btn-guardar-modulo" onClick={guardarModulo}>
                                Guardar Módulo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearCursosAdmin;
