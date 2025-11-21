// src/pages/CursoVista.jsx
import React, { useState, useEffect } from "react";
import "./CursoVista.css";

export default function CursoVista({ onNavigate, curso }) {
  const [modulosExpandidos, setModulosExpandidos] = useState({});

  // Ocultar navbar y footer
  useEffect(() => {
    // Ocultar navbar
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('.footer');
    
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Restaurar al salir del componente
    return () => {
      if (navbar) navbar.style.display = 'flex';
      if (footer) footer.style.display = 'block';
    };
  }, []);

  const toggleModulo = (index) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!curso) {
    return (
      <div className="curso-detalle">
        <div className="curso-no-encontrado">
          <h2>No se encontró el curso</h2>
          <button
            className="btn-volver"
            onClick={() => onNavigate("cursosusuario")}
          >
            ← Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="curso-detalle">
      <button
        className="btn-volver-superior"
        onClick={() => onNavigate("cursosusuario")}
      >
        ← Volver a cursos
      </button>

      <div className="detalle-contenido">
        <div className="detalle-columna-izquierda">
          <img
            src={curso.imagen}
            alt={curso.nombre}
            className="detalle-imagen"
          />
          
          <div className="detalle-datos">
            <div className="dato-item">
              <span className="dato-icono">⏱</span>
              <span className="dato-texto">Duración: {curso.horas} horas</span>
            </div>
            <div className="dato-item">
              <span className="dato-icono">📘</span>
              <span className="dato-texto">Nivel: {curso.nivel}</span>
            </div>
            <div className="dato-item">
              <span className="dato-icono">📦</span>
              <span className="dato-texto">Módulos: {curso.modulos ? curso.modulos.length : 0}</span>
            </div>
            <div className="dato-item">
              <span className="dato-icono">🗓</span>
              <span className="dato-texto">Publicado: {curso.fecha}</span>
            </div>
          </div>

          {/* Información del desarrollador */}
          <div className="desarrollador-info">
            <h4>Desarrollado por</h4>
            <p>Melissa Hernández & Ángel Hernández</p>
            <p>Unidades Tecnológicas de Santander - UTS</p>
            <p>Bucaramanga, Santander</p>
          </div>
        </div>

        <div className="detalle-columna-derecha">
          <h1 className="detalle-titulo">{curso.nombre}</h1>
          <p className="detalle-descripcion">{curso.descripcion}</p>

          {/* Línea de tiempo con módulos */}
          <div className="detalle-linea-tiempo">
            <h3 className="linea-tiempo-titulo">Contenido del curso</h3>
            
            <div className="linea-tiempo-contenedor">
              {/* Mostrar módulos */}
              {curso.modulos && curso.modulos.map((modulo, moduloIndex) => (
                <div key={moduloIndex} className="modulo-item">
                  <div 
                    className="modulo-header"
                    onClick={() => toggleModulo(moduloIndex)}
                  >
                    <div className="modulo-info">
                      <div className="modulo-punto"></div>
                      <div className="modulo-titulo">
                        <h4>Módulo {moduloIndex + 1}: {modulo.nombre}</h4>
                        <p className="modulo-descripcion">{modulo.descripcion}</p>
                      </div>
                    </div>
                    <span className="modulo-toggle">
                      {modulosExpandidos[moduloIndex] ? '−' : '+'}
                    </span>
                  </div>

                  {modulosExpandidos[moduloIndex] && (
                    <div className="modulo-contenido">
                      {/* Contenidos del módulo */}
                      {modulo.contenido && modulo.contenido.map((contenido, contenidoIndex) => (
                        <div key={contenidoIndex} className="contenido-item">
                          <div className="contenido-punto"></div>
                          <div className="contenido-info">
                            <h5>{contenido.titulo}</h5>
                            <p>{contenido.descripcion}</p>
                            {contenido.contenido && (
                              <div className="contenido-adicional">
                                <strong>Contenido:</strong> {contenido.contenido}
                              </div>
                            )}
                            {contenido.recursoExtra && (
                              <div className="recurso-extra">
                                <strong>Recurso extra:</strong> {contenido.recursoExtra}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Evaluación del módulo */}
                      {modulo.evaluacion && (
                        <div className="evaluacion-item">
                          <div className="evaluacion-punto"></div>
                          <div className="evaluacion-info">
                            <h5>Evaluación: {modulo.evaluacion.titulo}</h5>
                            <p>{modulo.evaluacion.descripcion}</p>
                            {modulo.evaluacion.preguntas && (
                              <span className="preguntas-count">
                                {modulo.evaluacion.preguntas.length} preguntas
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Evaluación final */}
              {curso.evaluacionFinal && (
                <div className="evaluacion-final-item">
                  <div className="evaluacion-final-punto"></div>
                  <div className="evaluacion-final-info">
                    <h4>Evaluación Final: {curso.evaluacionFinal.titulo}</h4>
                    <p>{curso.evaluacionFinal.descripcion}</p>
                    {curso.evaluacionFinal.preguntas && (
                      <span className="preguntas-count final">
                        {curso.evaluacionFinal.preguntas.length} preguntas
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje si no hay módulos */}
              {(!curso.modulos || curso.modulos.length === 0) && (
                <div className="sin-contenido">
                  <p>Este curso no tiene contenido disponible aún.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}