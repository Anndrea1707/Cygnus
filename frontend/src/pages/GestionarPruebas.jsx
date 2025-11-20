import React, { useState, useEffect } from "react";
import "./GestionarPruebas.css";

export default function GestionarPruebas({ onNavigate }) {
    const [pruebas, setPruebas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cargandoCategorias, setCargandoCategorias] = useState({});

    const categorias = [
        { key: "matematicas", label: "Matemáticas", icon: "🧮" },
        { key: "tecnologia", label: "Tecnología", icon: "💻" },
        { key: "idiomas", label: "Idiomas", icon: "🌎" }
    ];

    useEffect(() => {
        cargarPruebas();
    }, []);

    const cargarPruebas = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/pruebas/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                setPruebas(result.data);
            } else {
                console.error('Error al cargar pruebas:', result.message);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
        } finally {
            setLoading(false);
        }
    };

    const verificarCategoria = async (categoria) => {
        try {
            setCargandoCategorias(prev => ({ ...prev, [categoria]: true }));

            const response = await fetch('http://localhost:4000/api/pruebas/verificar-categoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoria })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error al verificar categoría:', error);
            return { success: false, existe: false };
        } finally {
            setCargandoCategorias(prev => ({ ...prev, [categoria]: false }));
        }
    };

    const handleCrearPrueba = async (categoria) => {
        const verificacion = await verificarCategoria(categoria);

        if (verificacion.existe) {
            alert(`Ya existe una prueba activa en ${categoria.label}. Solo se permite una prueba por categoría.`);
            return;
        }

        // Navegar a crear prueba con la categoría pre-seleccionada
        onNavigate("crearprueba", { categoriaPreSeleccionada: categoria.key });
    };

    const handleEditarPrueba = (pruebaId) => {
        console.log('Editar prueba:', pruebaId);
        // Navegar a editar prueba con el ID
        onNavigate("editarprueba", { pruebaId });
    };

    // En GestionarPruebas.jsx - actualiza la función handleEliminarPrueba:
    const handleEliminarPrueba = async (pruebaId, categoria) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la prueba de ${categoria}?`)) {
            return;
        }

        try {
            console.log('🗑️ Enviando solicitud para eliminar prueba:', pruebaId);

            const response = await fetch(`http://localhost:4000/api/pruebas/${pruebaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Si necesitas autenticación, añade el header aquí
                    // 'Authorization': `Bearer ${token}`
                }
            });

            console.log('📥 Respuesta del servidor - Status:', response.status);

            const result = await response.json();
            console.log('📥 Respuesta del servidor - Data:', result);

            if (result.success) {
                alert('✅ Prueba eliminada exitosamente');
                cargarPruebas(); // Recargar la lista
            } else {
                alert(`❌ Error al eliminar: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Error completo al eliminar:', error);
            alert('❌ Error de conexión al eliminar la prueba: ' + error.message);
        }
    };
    const obtenerPruebaPorCategoria = (categoriaKey) => {
        return pruebas.find(prueba =>
            prueba.categoria === categoriaKey && prueba.activa
        );
    };

    const volverAlPanel = () => {
        onNavigate("paneladmin");
    };

    if (loading) {
        return (
            <div className="gestionar-pruebas-container">
                <div className="pruebas-header">
                    <button className="btn-volver" onClick={volverAlPanel}>
                        ← Volver al Panel
                    </button>
                    <h1>Gestionar Pruebas de Conocimiento</h1>
                </div>
                <div className="loading">Cargando pruebas...</div>
            </div>
        );
    }

    return (
        <div className="gestionar-pruebas-container">
            {/* HEADER */}
            <div className="pruebas-header">
                <button className="btn-volver" onClick={volverAlPanel}>
                    ← Volver al Panel
                </button>
                <h1>Gestionar Pruebas de Conocimiento</h1>
                <p>Administra las pruebas disponibles por categoría</p>
            </div>

            {/* CATEGORÍAS */}
            <div className="categorias-grid">
                {categorias.map((categoria) => {
                    const prueba = obtenerPruebaPorCategoria(categoria.key);
                    const estaCargando = cargandoCategorias[categoria.key];

                    return (
                        <div key={categoria.key} className="categoria-card">
                            <div className="categoria-header">
                                <span className="categoria-icono">{categoria.icon}</span>
                                <h3>{categoria.label}</h3>
                            </div>

                            <div className="categoria-content">
                                {prueba ? (
                                    <div className="prueba-existente">
                                        <div className="prueba-info">
                                            <h4>Prueba Activa</h4>
                                            <p><strong>Preguntas:</strong> {prueba.preguntas.length}</p>
                                            <p><strong>Creada:</strong> {new Date(prueba.fechaCreacion).toLocaleDateString()}</p>
                                            <p><strong>Intentos:</strong> {prueba.intentosRealizados}</p>
                                        </div>

                                        <div className="prueba-actions">
                                            <button
                                                className="btn-editar"
                                                onClick={() => handleEditarPrueba(prueba._id)} // Asegúrate de que sea prueba._id
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => handleEliminarPrueba(prueba._id, categoria.label)}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prueba-inexistente">
                                        <p>No hay prueba activa en esta categoría</p>
                                        <button
                                            className="btn-crear"
                                            onClick={() => handleCrearPrueba(categoria)}
                                            disabled={estaCargando}
                                        >
                                            {estaCargando ? 'Verificando...' : '➕ Crear Prueba'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="categoria-status">
                                <span className={`status-badge ${prueba ? 'activa' : 'inactiva'}`}>
                                    {prueba ? '🟢 Activa' : '🔴 Sin prueba'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ESTADÍSTICAS */}
            <div className="estadisticas-section">
                <h3>📊 Resumen General</h3>
                <div className="estadisticas-grid">
                    <div className="estadistica-card">
                        <span className="estadistica-numero">
                            {pruebas.filter(p => p.activa).length}
                        </span>
                        <span className="estadistica-label">Pruebas Activas</span>
                    </div>
                    <div className="estadistica-card">
                        <span className="estadistica-numero">
                            {pruebas.reduce((total, p) => total + p.intentosRealizados, 0)}
                        </span>
                        <span className="estadistica-label">Total Intentos</span>
                    </div>
                    <div className="estadistica-card">
                        <span className="estadistica-numero">
                            {pruebas.length > 0
                                ? Math.round(pruebas.reduce((total, p) => total + p.promedioPuntaje, 0) / pruebas.length)
                                : 0
                            }%
                        </span>
                        <span className="estadistica-label">Promedio General</span>
                    </div>
                </div>
            </div>
        </div>
    );
}