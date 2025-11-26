import React, { useState, useEffect } from "react";
import "./GestionarPruebas.css";

export default function GestionarPruebas({ onNavigate }) {
    const [prueba, setPrueba] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accionLoading, setAccionLoading] = useState(false);
    const [showModalEliminar, setShowModalEliminar] = useState(false);
    const [pruebaAEliminar, setPruebaAEliminar] = useState(null);

    useEffect(() => {
        cargarPruebaActual();
    }, []);

    const cargarPruebaActual = async () => {
        try {
            setLoading(true);
            const resp = await fetch("https://cygnus-xjo4.onrender.com/api/pruebas/actual", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (resp.status === 404) {
                setPrueba(null);
            } else {
                const result = await resp.json();
                if (result.success) {
                    setPrueba({
                        ...result.prueba,
                        fechaCreacion: result.prueba.fechaCreacion || result.prueba.fecha || new Date().toISOString(),
                        intentosRealizados: result.prueba.intentosRealizados || 0,
                        promedioPuntaje: result.prueba.promedioPuntaje || 0
                    });
                } else {
                    console.error("Error cargando prueba:", result.message);
                    setPrueba(null);
                }
            }
        } catch (error) {
            console.error("Error de conexión al cargar prueba:", error);
            setPrueba(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCrearPrueba = async () => {
        try {
            setAccionLoading(true);
            const resp = await fetch("https://cygnus-xjo4.onrender.com/api/pruebas/actual", { method: "GET" });
            if (resp.status === 404) {
                onNavigate("crearprueba");
            } else {
                const r = await resp.json();
                alert("❌ Ya existe una prueba diagnóstica activa. Debes eliminarla antes de crear otra.");
            }
        } catch (error) {
            console.error("Error comprobando existencia de prueba:", error);
            alert("Error de conexión al verificar existencia de prueba");
        } finally {
            setAccionLoading(false);
        }
    };

    const handleEditarPrueba = (pruebaId) => {
        if (!pruebaId) return;
        onNavigate("editarprueba", { pruebaId: pruebaId });
    };

    const abrirModalEliminar = (pruebaId) => {
        if (!pruebaId) return;
        setPruebaAEliminar(pruebaId);
        setShowModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setShowModalEliminar(false);
        setPruebaAEliminar(null);
    };

    const handleEliminarPrueba = async () => {
        if (!pruebaAEliminar) return;

        try {
            setAccionLoading(true);
const resp = await fetch(`https://cygnus-xjo4.onrender.com/api/pruebas/${pruebaAEliminar}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            const result = await resp.json();
            if (result.success) {
                alert("✅ Prueba eliminada correctamente");
                cargarPruebaActual();
            } else {
                alert("❌ Error al eliminar: " + (result.message || "Desconocido"));
            }
        } catch (error) {
            console.error("Error eliminando prueba:", error);
            alert("❌ Error de conexión al eliminar la prueba");
        } finally {
            setAccionLoading(false);
            cerrarModalEliminar();
        }
    };

    const volverAlPanel = () => onNavigate("paneladmin");

    if (loading) {
        return (
            <div className="gestionar-pruebas-container">
                <div className="pruebas-header">
                    <button className="btn-volver" onClick={volverAlPanel}>← Volver al Panel</button>
                    <h1>Gestionar Prueba Diagnóstica</h1>
                </div>
                <div className="loading">Cargando información...</div>
            </div>
        );
    }

    return (
        <div className="gestionar-pruebas-container">
            {/* Modal de Confirmación de Eliminación */}
            {showModalEliminar && (
                <div className="modal-overlay">
                    <div className="modal-confirmacion">
                        <span className="modal-icon">⚠️</span>
                        <h3>¿Eliminar Prueba?</h3>
                        <p>Estás a punto de eliminar la prueba diagnóstica activa. Esta acción no se puede deshacer.</p>

                        <div className="modal-advertencia">
                            <p><strong>⚠️ Advertencia:</strong> Los usuarios no podrán realizar la prueba hasta que se cree una nueva.</p>
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="modal-btn-cancelar"
                                onClick={cerrarModalEliminar}
                                disabled={accionLoading}
                            >
                                ✕ Cancelar
                            </button>
                            <button
                                className="modal-btn-confirmar"
                                onClick={handleEliminarPrueba}
                                disabled={accionLoading}
                            >
                                {accionLoading ? (
                                    <span className="btn-loading"></span>
                                ) : (
                                    "🗑️ Confirmar Eliminación"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pruebas-header">
                <button className="btn-volver" onClick={volverAlPanel}>← Volver al Panel</button>
                <h1>Gestionar Prueba Diagnóstica</h1>
                <p>Administra la prueba diagnóstica única del sistema</p>
            </div>

            {prueba ? (
                <div className="single-prueba-card">
                    {/* Botones flotantes mejorados */}
                    <div className="single-prueba-actions">
                        <button
                            className="btn-floating btn-edit"
                            onClick={() => handleEditarPrueba(prueba._id)}
                            disabled={accionLoading}
                        >
                            ✏️ Editar
                        </button>

                        <button
                            className="btn-floating btn-delete"
                            onClick={() => abrirModalEliminar(prueba._id)}
                            disabled={accionLoading}
                        >
                            🗑️ Eliminar
                        </button>
                    </div>

                    {/* Título */}
                    <h2 className="single-prueba-title">
                        Prueba Diagnóstica Activa
                    </h2>

                    {/* Información de la prueba */}
                    <div className="single-prueba-info">
                        <div className="info-box">
                            <p className="info-box-title">Preguntas</p>
                            <p className="info-box-value p-icon-preguntas">
                                {prueba.preguntas.length}
                            </p>
                        </div>

                        <div className="info-box">
                            <p className="info-box-title">Fecha de creación</p>
                            <p className="info-box-value p-icon-fecha">
                                {new Date(prueba.fechaCreacion).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="info-box">
                            <p className="info-box-title">Intentos realizados</p>
                            <p className="info-box-value p-icon-intentos">
                                {prueba.intentosRealizados}
                            </p>
                        </div>

                        <div className="info-box">
                            <p className="info-box-title">Promedio general</p>
                            <p className="info-box-value">
                                {Math.round(prueba.promedioPuntaje)}%
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="single-prueba-card">
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h2 style={{ color: 'var(--color-light-text)', marginBottom: '20px' }}>
                            📝 No hay prueba activa
                        </h2>
                        <p style={{ color: 'var(--color-light-text)', marginBottom: '30px' }}>
                            Crea una nueva prueba diagnóstica para que los usuarios puedan comenzar a evaluar sus conocimientos.
                        </p>
                        <button
                            className="btn-crear"
                            onClick={handleCrearPrueba}
                            disabled={accionLoading}
                        >
                            ➕ Crear Nueva Prueba
                        </button>
                    </div>
                </div>
            )}

            <div className="estadisticas-section">
                <h3>📊 Resumen del Sistema</h3>
                <div className="estadisticas-grid">
                    <div className="estadistica-card">
                        <span className="estadistica-numero">{prueba ? 1 : 0}</span>
                        <span className="estadistica-label">Prueba Activa</span>
                    </div>
                    <div className="estadistica-card">
                        <span className="estadistica-numero">{prueba ? (prueba.intentosRealizados || 0) : 0}</span>
                        <span className="estadistica-label">Total Intentos</span>
                    </div>
                    <div className="estadistica-card">
                        <span className="estadistica-numero">{prueba ? Math.round(prueba.promedioPuntaje || 0) : 0}%</span>
                        <span className="estadistica-label">Promedio General</span>
                    </div>
                </div>
            </div>
        </div>
    );
}