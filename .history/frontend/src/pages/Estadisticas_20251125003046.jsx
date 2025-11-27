// frontend/src/pages/Estadisticas.jsx
import React, { useState, useEffect } from "react";
import NavbarPrincipal from "../components/NavbarPrincipal";
import Footer from "../components/Footer";
import "../pages/Estadisticas.css";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export default function Estadisticas({ usuario, onLogout, onNavigate, currentPage }) {
    const [datosHabilidad, setDatosHabilidad] = useState([]);
    const [datosRecordacion, setDatosRecordacion] = useState([]);

    useEffect(() => {
        if (!usuario) return;

        const fechaCreacion = new Date(usuario.creado_en);
        const fechaActual = new Date();

        const formatoFecha = (fecha) => fecha.toISOString().slice(0, 10);

        // Habilidad: mostrar crecimiento desde inicial hasta nueva
        const habilidadInicial = Math.min(Math.max(usuario.habilidad || 1, 1), 5);
        const habilidadNueva = Math.min(Math.max(usuario.habilidad_nueva || habilidadInicial, 1), 5);

        const datosH = [
            {
                fecha: "Creación", // Etiqueta más clara
                habilidad: habilidadInicial,
                habilidad_nueva: habilidadInicial
            },
            {
                fecha: "Hoy",
                habilidad: habilidadInicial,
                habilidad_nueva: habilidadNueva
            }
        ];
        setDatosHabilidad(datosH);

        // Recordación: comparar nivel de creación vs actual
        const recordacionInicial = Math.min(Math.max(usuario.nivel_recordacion || 0, 0), 5);
        const recordacionNueva = Math.min(Math.max(usuario.nivel_recordacion_nuevo || recordacionInicial, 0), 5);

        const datosR = [
            {
              fecha: "Creación",
              recordacion: Math.round((recordacionInicial / 1) * 100), // ya en 0-100
              recordacion_nueva: Math.round((recordacionInicial / 1) * 100)
            },
            {
              fecha: "Hoy",
              recordacion: Math.round((recordacionInicial / 1) * 100),
              recordacion_nueva: Math.round((recordacionNueva / 1) * 100)
            }
          ];
        setDatosRecordacion(datosR);

    }, [usuario]);

    const graficaLineStyle = {
        strokeWidth: 2,
        activeDot: { r: 6 }
    };

    const tooltipStyle = {
        backgroundColor: '#0f1830',
        borderRadius: '8px',
        border: 'none',
        color: '#fff'
    };

    const formatoHabilidad = (value) => value.toFixed(1);
    const formatoPorcentaje = (value) => `${Math.round(value )}%`;


    return (
        <div className="estadisticas-background">
            <NavbarPrincipal
                usuario={usuario}
                onLogout={onLogout}
                onNavigate={onNavigate}
                currentPage="estadisticas"
            />

            <main className="estadisticas-content">
                <header className="estadisticas-header">
                    <h1>📊 Estadísticas de Usuario</h1>
                    <p>Aquí podrás ver la evolución de tu habilidad y nivel de recordación.</p>
                </header>

                {/* Gráfica de Habilidad */}
                <section className="grafica-container">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={datosHabilidad} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                            <XAxis dataKey="fecha" stroke="#fff" />
                            <YAxis stroke="#fff" domain={[1, 5]} />
                            <Tooltip contentStyle={tooltipStyle} formatter={formatoHabilidad} />
                            <Legend />
                            <Line type="monotone" dataKey="habilidad" stroke="#667eea" {...graficaLineStyle} name="Habilidad Inicial" />
                            <Line type="monotone" dataKey="habilidad_nueva" stroke="#764ba2" {...graficaLineStyle} name="Habilidad Actual" />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                {/* Título entre gráficas */}
                <div className="titulo-entre-graficas" style={{ margin: '60px 0', textAlign: 'center' }}>
                    <h1>Tu Nivel de Recordación</h1>
                    <p>Acá se compara cuánto ha cambiado tu nivel de recordación</p>
                </div>

                {/* Gráfica de Recordación */}
                <section className="grafica-container">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={datosRecordacion} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                            <XAxis dataKey="fecha" stroke="#fff" />
                            <YAxis stroke="#fff" domain={[0, 5]} />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value) => formatoPorcentaje(value)}
                            />
                            <Legend formatter={(value) => (value === "recordacion" ? "Recordación Inicial" : "Recordación Actual")} />
                            <Line type="monotone" dataKey="recordacion" stroke="#f6ad55" {...graficaLineStyle} />
                            <Line type="monotone" dataKey="recordacion_nueva" stroke="#ed64a6" {...graficaLineStyle} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            </main>

            <Footer />
        </div>
    );
}
