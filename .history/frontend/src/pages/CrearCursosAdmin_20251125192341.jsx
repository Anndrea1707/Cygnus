import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CrearCursosAdmin.css";

const CrearCursosAdmin = ({ onNavigate, cursoEditar }) => {
    const [cargando, setCargando] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        horas: "",
        nivel: "",
        imagen: "",
    });

    const [modalModulo, setModalModulo] = useState(false);
    const [modalContenido, setModalContenido] = useState({
        abierto: false,
        moduloIndex: null,
        contenidoIndex: null,
        modo: 'crear'
    });
    const [modalEvaluacionModulo, setModalEvaluacionModulo] = useState({ abierto: false, moduloIndex: null });
    const [modalEvaluacionFinal, setModalEvaluacionFinal] = useState(false);
    const [modalPregunta, setModalPregunta] = useState({
        abierto: false,
        tipo: null,
        moduloIndex: null,
        preguntaIndex: null,
        modo: 'crear'
    });
    const [imagenPreview, setImagenPreview] = useState(null);
    const [modulos, setModulos] = useState([]);
    const [evaluacionFinal, setEvaluacionFinal] = useState({
        titulo: "",
        descripcion: "",
        preguntas: []
    });
    const [nuevoModulo, setNuevoModulo] = useState({
        nombre: "",
        descripcion: "",
        imagenPortada: "",
        cantidadContenido: "",
        contenido: [],
        evaluacion: { titulo: "", descripcion: "", preguntas: [] }
    });
    const [nuevoContenido, setNuevoContenido] = useState({
        titulo: "",
        descripcion: "",
        contenido: "",
        recursoExtra: "",
        tipoRecurso: "url"
    });
    const [nuevaPregunta, setNuevaPregunta] = useState({
        interrogante: "",
        opciones: ["", "", "", ""],
        opcionCorrecta: null, // ⭐ CAMBIO: null en lugar de string vacío
        dificultad: "1"
    });

    // Estados para controlar edición
    const [esEdicion, setEsEdicion] = useState(false);
    const [cursoId, setCursoId] = useState(null);
    const [cursoCargado, setCursoCargado] = useState(false);

    // Modal bonito (igual que Login)
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalTitulo, setModalTitulo] = useState("");
    const [modalMensaje, setModalMensaje] = useState("");
    const [modalIcono, setModalIcono] = useState("");
    const [modalCallback, setModalCallback] = useState(null);

    // Función para contar preguntas por nivel
    const contarPreguntasPorNivel = (preguntas) => {
        const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        preguntas.forEach(p => {
            conteo[p.dificultad] = (conteo[p.dificultad] || 0) + 1;
        });
        return conteo;
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        // Ejecutar callback si existe (por ejemplo navegar después de OK)
        if (modalCallback && typeof modalCallback === "function") {
            const cb = modalCallback;
            setModalCallback(null);
            // ejecutar en next tick
            setTimeout(() => cb(), 0);
        }
    };

    useEffect(() => {
        console.log("🔍 Props recibidas - cursoEditar:", cursoEditar);

        // Si hay cursoEditar con _id, estamos en modo edición
        if (cursoEditar && cursoEditar._id) {
            console.log("🎯 MODO EDICIÓN ACTIVADO");
            console.log("📦 Curso recibido:", cursoEditar);
            setEsEdicion(true);
            setCursoId(cursoEditar._id);
            llenarFormularioConDatos(cursoEditar);
            setCursoCargado(true);
        }
        // Si cursoEditar es undefined o null, es creación
        else {
            console.log("📝 MODO CREACIÓN ACTIVADO - No hay curso para editar");
            setEsEdicion(false);
            setCursoId(null);
            resetFormulario();
            setCursoCargado(true);
        }
    }, [cursoEditar]);

    const llenarFormularioConDatos = (curso) => {
        console.log("🖊️ Iniciando carga de datos en formulario...");

        if (!curso) {
            console.log("❌ Error: Curso es null o undefined");
            return;
        }

        try {
            // Información básica del curso (sin categoría)
            setForm({
                nombre: curso.nombre || "",
                descripcion: curso.descripcion || "",
                horas: curso.horasEstimadas || curso.horas || "",
                nivel: curso.nivel || "",
                imagen: curso.imagen || "",
            });

            // Módulos
            // Saneamos módulos para garantizar estructura completa
            const modulosSanitizados = (curso.modulos || []).map(m => ({
                ...m,
                contenido: Array.isArray(m.contenido) ? m.contenido : [],
                evaluacion: m.evaluacion
                    ? {
                        titulo: m.evaluacion.titulo || "",
                        descripcion: m.evaluacion.descripcion || "",
                        preguntas: Array.isArray(m.evaluacion.preguntas) ? m.evaluacion.preguntas : []
                    }
                    : { titulo: "", descripcion: "", preguntas: [] }
            }));

            setModulos(modulosSanitizados);

            // Evaluación final
            setEvaluacionFinal(curso.evaluacionFinal || {
                titulo: "",
                descripcion: "",
                preguntas: []
            });

            // Imagen preview
            setImagenPreview(curso.imagen || null);

            console.log("✅ FORMULARIO LLENADO EXITOSAMENTE");
            console.log("📊 DATOS CARGADOS:");
            console.log("   - Nombre:", curso.nombre);
            console.log("   - Horas:", curso.horasEstimadas || curso.horas);
            console.log("   - Nivel:", curso.nivel);
            console.log("   - Módulos:", curso.modulos?.length || 0);
            console.log("   - Preguntas evaluación final:", curso.evaluacionFinal?.preguntas?.length || 0);

        } catch (error) {
            console.error("❌ Error al llenar formulario:", error);
        }
    };

    const resetFormulario = () => {
        console.log("🔄 Iniciando reset de formulario...");
        setForm({
            nombre: "",
            descripcion: "",
            horas: "",
            nivel: "",
            imagen: "",
        });
        setModulos([]);
        setEvaluacionFinal({
            titulo: "",
            descripcion: "",
            preguntas: []
        });
        setImagenPreview(null);
        console.log("✅ Formulario reseteado para nuevo curso");
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'horas' ? Math.max(0, parseInt(value) || 0) : value
        }));
    };

    const subirImagen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagenPreview(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("imagen", file);
        try {
            const res = await api.post("/api/cursos/upload", formData);
            setForm({ ...form, imagen: res.data.url });
        } catch (error) {
            // Modal en vez de alert
            setModalIcono("❌");
            setModalTitulo("Error al subir imagen");
            setModalMensaje("Ocurrió un error al subir la imagen del curso.");
            setMostrarModal(true);
        }
    };

    const subirImagenModulo = async (e, setImagenState) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("imagen", file);
        try {
            const res = await api.post("/api/cursos/upload", formData);
            setImagenState(res.data.url);
        } catch (error) {
            setModalIcono("❌");
            setModalTitulo("Error al subir imagen del módulo");
            setModalMensaje("No se pudo subir la imagen de portada del módulo.");
            setMostrarModal(true);
        }
    };

    const subirRecursoExtra = async (e, setRecursoState) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("imagen", file);
        try {
            const res = await api.post("/api/cursos/upload", formData);
            setRecursoState(res.data.url);
        } catch (error) {
            setModalIcono("❌");
            setModalTitulo("Error al subir recurso");
            setModalMensaje("No se pudo subir el recurso extra.");
            setMostrarModal(true);
        }
    };

    const abrirModalModulo = () => {
        setNuevoModulo({
            nombre: "",
            descripcion: "",
            imagenPortada: "",
            cantidadContenido: "",
            contenido: [],
            evaluacion: { titulo: "", descripcion: "", preguntas: [] }
        });
        setModalModulo(true);
    };

    const guardarModulo = () => {
        if (!nuevoModulo.nombre.trim()) {
            setModalIcono("❌");
            setModalTitulo("Nombre requerido");
            setModalMensaje("El nombre del módulo es obligatorio.");
            setMostrarModal(true);
            return;
        }
        if (modulos.length >= 4) {
            setModalIcono("❌");
            setModalTitulo("Límite de módulos");
            setModalMensaje("Máximo 4 módulos permitidos.");
            setMostrarModal(true);
            return;
        }
        setModulos([...modulos, { ...nuevoModulo }]);
        setModalModulo(false);
    };

    const abrirModalContenidoCrear = (moduloIndex) => {
        setNuevoContenido({
            titulo: "",
            descripcion: "",
            contenido: "",
            recursoExtra: "",
            tipoRecurso: "url"
        });
        setModalContenido({
            abierto: true,
            moduloIndex,
            contenidoIndex: null,
            modo: 'crear'
        });
    };

    const abrirModalContenidoEditar = (moduloIndex, contenidoIndex) => {
        const contenido = modulos[moduloIndex].contenido[contenidoIndex];
        setNuevoContenido({
            titulo: contenido.titulo || "",
            descripcion: contenido.descripcion || "",
            contenido: contenido.contenido || "",
            recursoExtra: contenido.recursoExtra || "",
            tipoRecurso: contenido.recursoExtra?.startsWith('http') ? "url" : "archivo"
        });
        setModalContenido({
            abierto: true,
            moduloIndex,
            contenidoIndex,
            modo: 'editar'
        });
    };

    const guardarContenido = () => {
        if (!nuevoContenido.titulo.trim()) {
            setModalIcono("❌");
            setModalTitulo("Título requerido");
            setModalMensaje("El título del contenido es obligatorio.");
            setMostrarModal(true);
            return;
        }
        const modulosActualizados = [...modulos];
        if (modalContenido.modo === 'crear') {
            modulosActualizados[modalContenido.moduloIndex].contenido.push({ ...nuevoContenido });
        } else {
            modulosActualizados[modalContenido.moduloIndex].contenido[modalContenido.contenidoIndex] = { ...nuevoContenido };
        }
        setModulos(modulosActualizados);
        setModalContenido({ abierto: false, moduloIndex: null, contenidoIndex: null, modo: 'crear' });
    };

    const abrirModalEvaluacionModulo = (moduloIndex) => {
        setModalEvaluacionModulo({ abierto: true, moduloIndex });
    };

    const guardarEvaluacionModulo = () => {
        setModalEvaluacionModulo({ abierto: false, moduloIndex: null });
    };

    const abrirModalEvaluacionFinal = () => {
        setModalEvaluacionFinal(true);
    };

    const guardarEvaluacionFinal = () => {
        setModalEvaluacionFinal(false);
    };

    const abrirModalPreguntaCrear = (tipo, moduloIndex = null) => {
        setNuevaPregunta({
            interrogante: "",
            opciones: ["", "", "", ""],
            opcionCorrecta: null, // ⭐ CAMBIO: null en lugar de string vacío
            dificultad: "1"
        });
        setModalPregunta({
            abierto: true,
            tipo,
            moduloIndex,
            preguntaIndex: null,
            modo: 'crear'
        });
    };

    const abrirModalPreguntaEditar = (tipo, moduloIndex = null, preguntaIndex) => {
        let pregunta;
        if (tipo === 'modulo') {
            pregunta = modulos[moduloIndex].evaluacion.preguntas[preguntaIndex];
        } else {
            pregunta = evaluacionFinal.preguntas[preguntaIndex];
        }

        // ⭐ CORRECCIÓN: Asegurar que opcionCorrecta sea número
        const opcionCorrecta = typeof pregunta.opcionCorrecta === 'string'
            ? parseInt(pregunta.opcionCorrecta)
            : pregunta.opcionCorrecta;

        setNuevaPregunta({
            interrogante: pregunta.interrogante || "",
            opciones: [...pregunta.opciones],
            opcionCorrecta: opcionCorrecta, // ⭐ Ahora es número (0, 1, 2, 3)
            dificultad: pregunta.dificultad?.toString() || "1"
        });
        setModalPregunta({
            abierto: true,
            tipo,
            moduloIndex,
            preguntaIndex,
            modo: 'editar'
        });
    };

    const guardarPregunta = () => {
        if (!nuevaPregunta.interrogante.trim() || nuevaPregunta.opciones.some(op => !op.trim())) {
            setModalIcono("❌");
            setModalTitulo("Pregunta incompleta");
            setModalMensaje("Completa todas las opciones de la pregunta.");
            setMostrarModal(true);
            return;
        }
        if (nuevaPregunta.opcionCorrecta === null || nuevaPregunta.opcionCorrecta === undefined) {
            setModalIcono("❌");
            setModalTitulo("Seleccione correcta");
            setModalMensaje("Selecciona la opción correcta de la pregunta.");
            setMostrarModal(true);
            return;
        }


        // ⭐ CORRECCIÓN: Asegurar que opcionCorrecta sea número
        const preguntaParaGuardar = {
            ...nuevaPregunta,
            opcionCorrecta: nuevaPregunta.opcionCorrecta, // Ya es número (0, 1, 2, 3)
            dificultad: parseInt(nuevaPregunta.dificultad)
        };
        // Obtener preguntas actuales
        if (modalPregunta.tipo === 'modulo') {
            const preguntasModulo = modulos[modalPregunta.moduloIndex].evaluacion.preguntas;
            const porNivel = contarPreguntasPorNivel(preguntasModulo);

            // Validación 20 preguntas
            if (modalPregunta.modo === 'crear' && preguntasModulo.length >= 20) {
                setModalIcono("❌");
                setModalTitulo("Límite alcanzado");
                setModalMensaje("Este módulo ya tiene las 20 preguntas permitidas.");
                setMostrarModal(true);
                return;
            }

            // Validación 4 por dificultad
            if (modalPregunta.modo === 'crear' && porNivel[preguntaParaGuardar.dificultad] >= 4) {
                setModalIcono("❌");
                setModalTitulo("Límite por dificultad");
                setModalMensaje(`Ya hay 4 preguntas de dificultad ${preguntaParaGuardar.dificultad} en este módulo.`);
                setMostrarModal(true);
                return;
            }
        }

        if (modalPregunta.tipo === 'modulo') {
            const modulosActualizados = [...modulos];
            if (modalPregunta.modo === 'crear') {
                modulosActualizados[modalPregunta.moduloIndex].evaluacion.preguntas.push(preguntaParaGuardar);
            } else {
                modulosActualizados[modalPregunta.moduloIndex].evaluacion.preguntas[modalPregunta.preguntaIndex] = preguntaParaGuardar;
            }
            setModulos(modulosActualizados);
        } else {
            if (modalPregunta.modo === 'crear') {
                setEvaluacionFinal(prev => ({
                    ...prev,
                    preguntas: [...prev.preguntas, preguntaParaGuardar]
                }));
            } else {
                const nuevasPreguntas = [...evaluacionFinal.preguntas];
                nuevasPreguntas[modalPregunta.preguntaIndex] = preguntaParaGuardar;
                setEvaluacionFinal(prev => ({
                    ...prev,
                    preguntas: nuevasPreguntas
                }));
            }
        }
        setModalPregunta({ abierto: false, tipo: null, moduloIndex: null, preguntaIndex: null, modo: 'crear' });
    };

    const manejarOpcionCambio = (index, value) => {
        const nuevasOpciones = [...nuevaPregunta.opciones];
        nuevasOpciones[index] = value;
        setNuevaPregunta(prev => ({ ...prev, opciones: nuevasOpciones }));
    };

    // ⭐ CORRECCIÓN: Función para manejar selección de opción correcta
    const manejarOpcionCorrectaCambio = (index) => {
        setNuevaPregunta(prev => ({
            ...prev,
            opcionCorrecta: index // ⭐ Ahora es número (0, 1, 2, 3)
        }));
    };

    const crearCurso = async () => {
        if (!validarCursoCompleto()) return;

        const cursoData = {
            ...form,
            horas: form.horas,
            modulos: modulos,
            evaluacionFinal: evaluacionFinal
        };

        console.log("💾 Guardando curso:", cursoData);
        try {
            if (esEdicion && cursoId) {
                await axios.put(`http://localhost:4000/api/cursos/${cursoId}`, cursoData);
                // Mostrar modal de éxito y navegar al cerrar
                setModalIcono("🚀");
                setModalTitulo("Curso actualizado");
                setModalMensaje("¡Curso actualizado exitosamente!");
                setModalCallback(() => () => onNavigate("cursosadmin"));
                setMostrarModal(true);
            } else {
                await axios.post("http://localhost:4000/api/cursos", cursoData);
                setModalIcono("🚀");
                setModalTitulo("Curso creado");
                setModalMensaje("¡Curso creado exitosamente!");
                setModalCallback(() => () => onNavigate("cursosadmin"));
                setMostrarModal(true);
            }
        } catch (error) {
            console.error("Error al guardar el curso:", error);
            setModalIcono("❌");
            setModalTitulo("Error al guardar");
            setModalMensaje(`Error al guardar el curso: ${error.response?.data?.mensaje || error.message}`);
            setMostrarModal(true);
        }
    };

    const validarCursoCompleto = () => {
        // Ya no se requiere categoría
        if (!form.nombre || !form.descripcion || !form.horas || !form.nivel || !form.imagen) {
            setModalIcono("❌");
            setModalTitulo("Campos incompletos");
            setModalMensaje("Completa todos los campos básicos del curso.");
            setMostrarModal(true);
            return false;
        }
        if (modulos.length === 0) {
            setModalIcono("❌");
            setModalTitulo("Sin módulos");
            setModalMensaje("Agrega al menos un módulo al curso.");
            setMostrarModal(true);
            return false;
        }
        for (let modulo of modulos) {

            // Validar contenido
            if (!Array.isArray(modulo.contenido) || modulo.contenido.length === 0) {
                setModalIcono("❌");
                setModalTitulo("Módulo sin contenido");
                setModalMensaje(`El módulo "${modulo.nombre}" debe tener al menos un contenido.`);
                setMostrarModal(true);
                return false;
            }

            // Validar evaluación del módulo
            const preguntas = modulo.evaluacion.preguntas;

            if (preguntas.length !== 20) {
                setModalIcono("❌");
                setModalTitulo("Evaluación incompleta");
                setModalMensaje(`El módulo "${modulo.nombre}" debe tener exactamente 20 preguntas.`);
                setMostrarModal(true);
                return false;
            }

            const porNivel = contarPreguntasPorNivel(preguntas);

            for (let nivel = 1; nivel <= 5; nivel++) {
                if (porNivel[nivel] !== 4) {
                    setModalIcono("❌");
                    setModalTitulo("Evaluación inválida");
                    setModalMensaje(`El módulo "${modulo.nombre}" debe tener 4 preguntas de dificultad ${nivel}.`);
                    setMostrarModal(true);
                    return false;
                }
            }
        }

        return true;
    };

    const eliminarModulo = (index) => {
        const nuevosModulos = modulos.filter((_, i) => i !== index);
        setModulos(nuevosModulos);
    };

    const eliminarContenido = (moduloIndex, contenidoIndex) => {
        const modulosActualizados = [...modulos];
        modulosActualizados[moduloIndex].contenido = modulosActualizados[moduloIndex].contenido.filter((_, i) => i !== contenidoIndex);
        setModulos(modulosActualizados);
    };

    const eliminarPregunta = (tipo, moduloIndex, preguntaIndex) => {
        if (tipo === 'modulo') {
            const modulosActualizados = [...modulos];
            modulosActualizados[moduloIndex].evaluacion.preguntas = modulosActualizados[moduloIndex].evaluacion.preguntas.filter((_, i) => i !== preguntaIndex);
            setModulos(modulosActualizados);
        } else {
            setEvaluacionFinal(prev => ({
                ...prev,
                preguntas: prev.preguntas.filter((_, i) => i !== preguntaIndex)
            }));
        }
    };

    if (!cursoCargado) {
        return (
            <div className="crear-curso-page">
                <div className="form-card">
                    <h2>Cargando...</h2>
                    <p>Por favor espera mientras cargamos la información.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="crear-curso-page">
            <button className="back-btn" onClick={() => onNavigate("cursosadmin")}>
                ← Volver a Cursos
            </button>

            <div className="form-card">
                <h1 className="titulo-principal">
                    {esEdicion ? `Editar Curso: ${form.nombre}` : "Crear Nuevo Curso"}
                </h1>
                <p className="subtitulo">
                    {esEdicion
                        ? "Modifica los campos que necesites del curso existente"
                        : "Completa todos los campos para registrar un nuevo curso completo"}
                </p>

                <div className="seccion-curso">
                    <h2 className="titulo-seccion">Información Básica del Curso</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Nombre del curso *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={manejarCambio}
                                placeholder="Ej: Fundamentos de Álgebra"
                            />
                        </div>

                        <div className="input-group">
                            <label>Horas estimadas *</label>
                            <input
                                type="number"
                                name="horas"
                                value={form.horas}
                                onChange={manejarCambio}
                                min="0"
                                placeholder="40"
                            />
                        </div>

                        <div className="input-group">
                            <label>Nivel *</label>
                            <select name="nivel" value={form.nivel} onChange={manejarCambio}>
                                <option value="">Seleccionar nivel</option>
                                <option value="básico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                        </div>

                        {/* CATEGORÍA ELIMINADA: no se renderiza */}

                        <div className="input-group full">
                            <label>Descripción *</label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={manejarCambio}
                                rows="5"
                                placeholder="Explica de qué trata el curso..."
                            />
                        </div>

                        <div className="input-group full">
                            <label>Imagen del curso *</label>
                            <input type="file" accept="image/*" onChange={subirImagen} />
                            {imagenPreview && <img src={imagenPreview} alt="Vista previa" className="imagen-preview" />}
                            {form.imagen && !imagenPreview && (
                                <div>
                                    <p>Imagen actual:</p>
                                    <img src={form.imagen} alt="Imagen actual" className="imagen-preview" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="seccion-curso">
                    <div className="seccion-header">
                        <h2 className="titulo-seccion">Módulos del Curso</h2>
                        <span className="contador">{modulos.length}/4 módulos</span>
                    </div>

                    <button
                        className="btn-agregar-modulo"
                        onClick={abrirModalModulo}
                        disabled={modulos.length >= 4}
                    >
                        + Agregar Módulo
                    </button>

                    <div className="modulos-lista">
                        {modulos.map((modulo, moduloIndex) => (
                            <div key={moduloIndex} className="modulo-card">
                                <div className="modulo-header">
                                    <h3>{modulo.nombre}</h3>
                                    <button
                                        className="btn-eliminarB"
                                        onClick={() => eliminarModulo(moduloIndex)}
                                        title="Eliminar módulo"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="modulo-descripcion">{modulo.descripcion}</p>

                                <div className="modulo-acciones">
                                    <button
                                        className="btn-secundario"
                                        onClick={() => abrirModalContenidoCrear(moduloIndex)}
                                    >
                                        + Contenido ({modulo.contenido.length})
                                    </button>
                                    <button
                                        className="btn-secundario"
                                        onClick={() => abrirModalEvaluacionModulo(moduloIndex)}
                                    >
                                        Evaluación ({modulo.evaluacion.preguntas.length})
                                    </button>
                                </div>

                                {modulo.contenido && modulo.contenido.length > 0 && (
                                    <div className="contenido-lista">
                                        <h4>Contenido:</h4>
                                        {modulo.contenido.map((contenido, contenidoIndex) => (
                                            <div key={contenidoIndex} className="contenido-item">
                                                <span>{contenido.titulo}</span>
                                                <div className="acciones-contenido">
                                                    <button
                                                        className="btn-editar-pequeno"
                                                        onClick={() => abrirModalContenidoEditar(moduloIndex, contenidoIndex)}
                                                        title="Editar contenido"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-eliminarB-pequeno"
                                                        onClick={() => eliminarContenido(moduloIndex, contenidoIndex)}
                                                        title="Eliminar contenido"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {modulo.evaluacion && modulo.evaluacion.preguntas.length > 0 && (
                                    <div className="preguntas-lista">
                                        <h4>Preguntas de evaluación:</h4>
                                        {modulo.evaluacion.preguntas.map((pregunta, index) => (
                                            <div key={index} className="pregunta-item">
                                                <span>Dificultad {pregunta.dificultad}: {pregunta.interrogante.substring(0, 50)}...</span>
                                                <div className="acciones-pregunta">
                                                    <button
                                                        className="btn-editar-pequeno"
                                                        onClick={() => abrirModalPreguntaEditar('modulo', moduloIndex, index)}
                                                        title="Editar pregunta"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-eliminarB-pequeno"
                                                        onClick={() => eliminarPregunta('modulo', moduloIndex, index)}
                                                        title="Eliminar pregunta"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="seccion-curso">
                    <div className="seccion-header">
                        <h2 className="titulo-seccion">Evaluación Final del Curso</h2>
                        <span className="contador">{evaluacionFinal.preguntas.length}/20 preguntas</span>
                    </div>

                    <button
                        className="btn-agregar-modulo"
                        onClick={abrirModalEvaluacionFinal}
                    >
                        Configurar Evaluación Final
                    </button>

                    {evaluacionFinal.preguntas.length > 0 && (
                        <div className="preguntas-lista">
                            <h4>Preguntas agregadas:</h4>
                            {evaluacionFinal.preguntas.map((pregunta, index) => (
                                <div key={index} className="pregunta-item">
                                    <span>Dificultad {pregunta.dificultad}: {pregunta.interrogante.substring(0, 50)}...</span>
                                    <div className="acciones-pregunta">
                                        <button
                                            className="btn-editar-pequeno"
                                            onClick={() => abrirModalPreguntaEditar('final', null, index)}
                                            title="Editar pregunta"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-eliminarB-pequeno"
                                            onClick={() => eliminarPregunta('final', null, index)}
                                            title="Eliminar pregunta"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="btn-crear-curso" onClick={crearCurso}>
                    {esEdicion ? "Guardar Cambios" : "Crear Curso Completo"}
                </button>
            </div>

            {modalModulo && (
                <div className="backdrop">
                    <div className="modal-card grande">
                        <h2>Nuevo Módulo</h2>
                        <div className="modal-form">
                            <div className="input-group">
                                <label>Nombre del módulo *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del módulo"
                                    value={nuevoModulo.nombre}
                                    onChange={(e) => setNuevoModulo({ ...nuevoModulo, nombre: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Descripción del módulo"
                                    value={nuevoModulo.descripcion}
                                    onChange={(e) => setNuevoModulo({ ...nuevoModulo, descripcion: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="input-group">
                                <label>Imagen de portada</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => subirImagenModulo(e, (url) => setNuevoModulo({ ...nuevoModulo, imagenPortada: url }))}
                                />
                            </div>
                        </div>
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

            {modalContenido.abierto && (
                <div className="backdrop">
                    <div className="modal-card grande">
                        <h2>{modalContenido.modo === 'editar' ? 'Editar Contenido' : 'Agregar Contenido al Módulo'}</h2>
                        <div className="modal-form">
                            <div className="input-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    placeholder="Título del contenido"
                                    value={nuevoContenido.titulo}
                                    onChange={(e) => setNuevoContenido({ ...nuevoContenido, titulo: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Descripción del contenido"
                                    value={nuevoContenido.descripcion}
                                    onChange={(e) => setNuevoContenido({ ...nuevoContenido, descripcion: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="input-group">
                                <label>Contenido (URL) *</label>
                                <input
                                    type="text"
                                    placeholder="URL del video, documento, imagen, etc."
                                    value={nuevoContenido.contenido}
                                    onChange={(e) => setNuevoContenido({ ...nuevoContenido, contenido: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Recurso extra (opcional)</label>
                                <div className="recurso-extra-options">
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="tipoRecurso"
                                                value="url"
                                                checked={nuevoContenido.tipoRecurso === "url"}
                                                onChange={(e) => setNuevoContenido({ ...nuevoContenido, tipoRecurso: e.target.value, recursoExtra: "" })}
                                            />
                                            URL
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="tipoRecurso"
                                                value="archivo"
                                                checked={nuevoContenido.tipoRecurso === "archivo"}
                                                onChange={(e) => setNuevoContenido({ ...nuevoContenido, tipoRecurso: e.target.value, recursoExtra: "" })}
                                            />
                                            Subir archivo
                                        </label>
                                    </div>

                                    {nuevoContenido.tipoRecurso === "url" ? (
                                        <input
                                            type="text"
                                            placeholder="URL del recurso adicional"
                                            value={nuevoContenido.recursoExtra}
                                            onChange={(e) => setNuevoContenido({ ...nuevoContenido, recursoExtra: e.target.value })}
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            onChange={(e) => subirRecursoExtra(e, (url) => setNuevoContenido({ ...nuevoContenido, recursoExtra: url }))}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModalContenido({ abierto: false, moduloIndex: null, contenidoIndex: null, modo: 'crear' })}>
                                Cancelar
                            </button>
                            <button className="btn-guardar-modulo" onClick={guardarContenido}>
                                {modalContenido.modo === 'editar' ? 'Actualizar Contenido' : 'Guardar Contenido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEvaluacionModulo.abierto && (
                <div className="backdrop">
                    <div className="modal-card grande">
                        <h2>Evaluación del Módulo: {modulos[modalEvaluacionModulo.moduloIndex]?.nombre}</h2>
                        <div className="modal-form">
                            <div className="input-group">
                                <label>Título de la evaluación</label>
                                <input
                                    type="text"
                                    placeholder="Título de la evaluación"
                                    value={modulos[modalEvaluacionModulo.moduloIndex]?.evaluacion?.titulo || ""}
                                    onChange={(e) => {
                                        const modulosActualizados = [...modulos];
                                        modulosActualizados[modalEvaluacionModulo.moduloIndex].evaluacion.titulo = e.target.value;
                                        setModulos(modulosActualizados);
                                    }}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Descripción de la evaluación"
                                    value={modulos[modalEvaluacionModulo.moduloIndex]?.evaluacion?.descripcion || ""}
                                    onChange={(e) => {
                                        const modulosActualizados = [...modulos];
                                        modulosActualizados[modalEvaluacionModulo.moduloIndex].evaluacion.descripcion = e.target.value;
                                        setModulos(modulosActualizados);
                                    }}
                                    rows="3"
                                />
                            </div>

                            <div className="seccion-preguntas">
                                <div className="seccion-header">
                                    <h4>Preguntas de la evaluación ({modulos[modalEvaluacionModulo.moduloIndex]?.evaluacion?.preguntas.length})</h4>
                                    <div className="dificultad-stats">
                                        {[1, 2, 3, 4, 5].map(nivel => (
                                            <span key={nivel}>
                                                Nivel {nivel}: {
                                                    contarPreguntasPorNivel(
                                                        modulos[modalEvaluacionModulo.moduloIndex].evaluacion.preguntas
                                                    )[nivel]
                                                }/4
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        className="btn-agregar-pequeno"
                                        onClick={() => abrirModalPreguntaCrear('modulo', modalEvaluacionModulo.moduloIndex)}
                                    >
                                        + Agregar Pregunta
                                    </button>
                                </div>

                                {modulos[modalEvaluacionModulo.moduloIndex]?.evaluacion?.preguntas.length === 0 ? (
                                    <p className="sin-elementos">No hay preguntas agregadas</p>
                                ) : (
                                    modulos[modalEvaluacionModulo.moduloIndex]?.evaluacion?.preguntas.map((pregunta, index) => (
                                        <div key={index} className="pregunta-item">
                                            <span>Dificultad {pregunta.dificultad}: {pregunta.interrogante.substring(0, 50)}...</span>
                                            <div className="acciones-pregunta">
                                                <button
                                                    className="btn-editar-pequeno"
                                                    onClick={() => abrirModalPreguntaEditar('modulo', modalEvaluacionModulo.moduloIndex, index)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-eliminarB-pequeno"
                                                    onClick={() => eliminarPregunta('modulo', modalEvaluacionModulo.moduloIndex, index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModalEvaluacionModulo({ abierto: false, moduloIndex: null })}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEvaluacionFinal && (
                <div className="backdrop">
                    <div className="modal-card grande">
                        <h2>Evaluación Final del Curso</h2>
                        <div className="modal-form">
                            <div className="input-group">
                                <label>Título de la evaluación *</label>
                                <input
                                    type="text"
                                    placeholder="Título de la evaluación final"
                                    value={evaluacionFinal.titulo}
                                    onChange={(e) => setEvaluacionFinal({ ...evaluacionFinal, titulo: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Descripción de la evaluación final"
                                    value={evaluacionFinal.descripcion}
                                    onChange={(e) => setEvaluacionFinal({ ...evaluacionFinal, descripcion: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="seccion-preguntas">
                                <div className="seccion-header">
                                    <h4>Preguntas de la evaluación final ({evaluacionFinal.preguntas.length}/20)</h4>
                                    <button
                                        className="btn-agregar-pequeno"
                                        onClick={() => abrirModalPreguntaCrear('final')}
                                        disabled={evaluacionFinal.preguntas.length >= 20}
                                    >
                                        + Agregar Pregunta
                                    </button>
                                </div>

                                <div className="dificultad-info">
                                    <p>Debe haber 4 preguntas por cada nivel de dificultad (1-5)</p>
                                    <div className="dificultad-stats">
                                        {[1, 2, 3, 4, 5].map(nivel => (
                                            <span key={nivel} className={`dificultad-stat ${evaluacionFinal.preguntas.filter(p => p.dificultad == nivel).length === 4 ? 'completo' : ''}`}>
                                                Nivel {nivel}: {evaluacionFinal.preguntas.filter(p => p.dificultad == nivel).length}/4
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {evaluacionFinal.preguntas.length === 0 ? (
                                    <p className="sin-elementos">No hay preguntas agregadas</p>
                                ) : (
                                    evaluacionFinal.preguntas.map((pregunta, index) => (
                                        <div key={index} className="pregunta-item">
                                            <span>Dificultad {pregunta.dificultad}: {pregunta.interrogante.substring(0, 50)}...</span>
                                            <div className="acciones-pregunta">
                                                <button
                                                    className="btn-editar-pequeno"
                                                    onClick={() => abrirModalPreguntaEditar('final', null, index)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-eliminarB-pequeno"
                                                    onClick={() => eliminarPregunta('final', null, index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModalEvaluacionFinal(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalPregunta.abierto && (
                <div className="backdrop">
                    <div className="modal-card grande">
                        <h2>{modalPregunta.modo === 'editar' ? 'Editar Pregunta' : 'Agregar Pregunta'}</h2>
                        <div className="modal-form">
                            <div className="input-group">
                                <label>Pregunta *</label>
                                <textarea
                                    placeholder="Escribe la pregunta aquí..."
                                    value={nuevaPregunta.interrogante}
                                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, interrogante: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="input-group">
                                <label>Dificultad *</label>
                                <select
                                    value={nuevaPregunta.dificultad}
                                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })}
                                >
                                    {[1, 2, 3, 4, 5].map(nivel => (
                                        <option key={nivel} value={nivel}>Nivel {nivel}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="opciones-pregunta">
                                <label>Opciones de respuesta *</label>
                                {nuevaPregunta.opciones.map((opcion, index) => (
                                    <div key={index} className="opcion-input">
                                        <span>Opción {index + 1}:</span>
                                        <input
                                            type="text"
                                            placeholder={`Opción ${index + 1}`}
                                            value={opcion}
                                            onChange={(e) => manejarOpcionCambio(index, e.target.value)}
                                        />
                                        <input
                                            type="radio"
                                            name="opcionCorrecta"
                                            checked={nuevaPregunta.opcionCorrecta === index} // ⭐ CAMBIO: comparación con número
                                            onChange={() => manejarOpcionCorrectaCambio(index)} // ⭐ CAMBIO: nueva función
                                        />
                                        <label>Correcta</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancelar" onClick={() => setModalPregunta({ abierto: false, tipo: null, moduloIndex: null, preguntaIndex: null, modo: 'crear' })}>
                                Cancelar
                            </button>
                            <button className="btn-guardar-modulo" onClick={guardarPregunta}>
                                {modalPregunta.modo === 'editar' ? 'Actualizar Pregunta' : 'Guardar Pregunta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- MODAL GLOBAL (estilo Login) ---------- */}
            {mostrarModal && (
                <div className="modal-overlay-login">
                    <div className="modal-login">
                        <div className="modal-icon-login">{modalIcono}</div>
                        <h3>{modalTitulo}</h3>
                        <p>{modalMensaje}</p>
                        <button className="modal-btn-aceptar" onClick={cerrarModal}>Aceptar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearCursosAdmin;