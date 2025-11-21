const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Usuario = require("./Usuario");

// =============================================
// MODELO DE PRUEBA DIAGNÓSTICA ÚNICA
// =============================================

const opcionSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: [true, 'El texto de la opción es requerido'],
        trim: true
    },
    letra: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
    }
});

const preguntaSchema = new mongoose.Schema({
    enunciado: {
        type: String,
        required: [true, 'El enunciado de la pregunta es requerido'],
        trim: true
    },
    opciones: {
        type: [opcionSchema],
        validate: {
            validator: function (opciones) {
                return opciones.length === 4;
            },
            message: 'Cada pregunta debe tener exactamente 4 opciones'
        }
    },
    respuestaCorrecta: {
        type: String,
        required: [true, 'La respuesta correcta es requerida'],
        enum: ['A', 'B', 'C', 'D']
    }
});

const pruebaDiagnosticaSchema = new mongoose.Schema({
    // ELIMINADO: campo categoría para prueba única
    preguntas: {
        type: [preguntaSchema],
        validate: {
            validator: function (preguntas) {
                return preguntas.length === 5;
            },
            message: 'La prueba debe tener exactamente 5 preguntas'
        }
    },
    creadoPor: {
        type: String,
        required: true
    },
    nombreCreador: {
        type: String,
        default: "Administrador"
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    activa: {
        type: Boolean,
        default: true
    },
    intentosRealizados: {
        type: Number,
        default: 0
    },
    promedioPuntaje: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const PruebaDiagnostica = mongoose.model('PruebaDiagnostica', pruebaDiagnosticaSchema);

// =============================================
// MIDDLEWARES
// =============================================

const authMiddleware = async (req, res, next) => {
    try {
        req.usuario = {
            id: "admin-" + Date.now(),
            nombre: "Administrador"
        };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'No autorizado' });
    }
};

const adminMiddleware = async (req, res, next) => {
    next();
};

// =============================================
// RUTAS ACTUALIZADAS PARA PRUEBA ÚNICA
// =============================================

// ✅ 1. Obtener la prueba activa única
router.get("/actual", async (req, res) => {
    try {
        const prueba = await PruebaDiagnostica.findOne({ activa: true });

        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: "No hay prueba diagnóstica creada"
            });
        }

        // Enviar sin respuestas correctas
        const pruebaParaUsuario = {
            _id: prueba._id,
            preguntas: prueba.preguntas.map(p => ({
                enunciado: p.enunciado,
                opciones: p.opciones.map(op => ({
                    letra: op.letra,
                    texto: op.texto
                }))
            }))
        };

        res.json({ success: true, prueba: pruebaParaUsuario });

    } catch (error) {
        console.error("Error al obtener la prueba:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

// ✅ 2. Verificar estado del usuario
router.get("/verificar-estado/:usuarioId", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }

        res.json({
            success: true,
            pruebaCompletada: usuario.prueba_conocimiento?.completada || false,
            habilidadActual: usuario.prueba_conocimiento?.habilidad || 1
        });

    } catch (error) {
        console.error("Error al verificar estado de prueba:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error del servidor" 
        });
    }
});

// ✅ 3. Calificar prueba
router.post("/calificar", async (req, res) => {
    try {
        const { usuarioId, pruebaId, respuestas } = req.body;

        const prueba = await PruebaDiagnostica.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ 
                success: false, 
                message: "Prueba no encontrada" 
            });
        }

        let correctas = 0;
        respuestas.forEach((respuestaUsuario, index) => {
            const letraRespuesta = String.fromCharCode(65 + respuestaUsuario);
            if (letraRespuesta === prueba.preguntas[index].respuestaCorrecta) {
                correctas++;
            }
        });

        const puntuacion = (correctas / prueba.preguntas.length) * 100;

        let habilidad;
        if (puntuacion >= 90) habilidad = 5;
        else if (puntuacion >= 70) habilidad = 4;
        else if (puntuacion >= 50) habilidad = 3;
        else if (puntuacion >= 30) habilidad = 2;
        else habilidad = 1;

        // Actualizar usuario
        const usuario = await Usuario.findByIdAndUpdate(
            usuarioId,
            {
                "prueba_conocimiento.completada": true,
                "prueba_conocimiento.fecha_realizacion": new Date(),
                "prueba_conocimiento.puntuacion": puntuacion,
                "prueba_conocimiento.habilidad": habilidad
            },
            { new: true }
        );

        // Actualizar estadísticas de la prueba
        prueba.intentosRealizados += 1;
        prueba.promedioPuntaje = (prueba.promedioPuntaje * (prueba.intentosRealizados - 1) + puntuacion) / prueba.intentosRealizados;
        await prueba.save();

        res.json({
            success: true,
            puntuacion,
            correctas: `${correctas}/${prueba.preguntas.length}`,
            habilidad,
            message: `¡Prueba completada! Tu nivel de habilidad es ${habilidad}`
        });

    } catch (error) {
        console.error("Error al calificar prueba:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error del servidor al calificar" 
        });
    }
});

// ✅ 4. Crear prueba (solo una activa)
router.post('/crear', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));

        // Verificar si ya existe prueba activa
        const pruebaExistente = await PruebaDiagnostica.findOne({ activa: true });
        if (pruebaExistente) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una prueba diagnóstica activa. Debe eliminarla antes de crear otra."
            });
        }

        const { preguntas } = req.body;
        const creadoPor = req.usuario.id;
        const nombreCreador = req.usuario.nombre;

        // Validar número de preguntas
        if (!preguntas || preguntas.length !== 5) {
            return res.status(400).json({
                success: false,
                message: 'La prueba debe tener exactamente 5 preguntas'
            });
        }

        console.log('🔍 Procesando preguntas...');

        // Procesar preguntas
        const preguntasProcesadas = preguntas.map((pregunta, index) => {
            console.log(`📝 Procesando pregunta ${index + 1}:`, pregunta.pregunta);

            const opcionesProcesadas = pregunta.opciones.map((opcion, indexOpcion) => {
                if (!opcion || opcion.trim() === '') {
                    throw new Error(`La opción ${indexOpcion + 1} de la pregunta ${index + 1} está vacía`);
                }
                return {
                    texto: opcion,
                    letra: String.fromCharCode(65 + indexOpcion)
                };
            });

            return {
                enunciado: pregunta.pregunta,
                opciones: opcionesProcesadas,
                respuestaCorrecta: String.fromCharCode(65 + pregunta.respuestaCorrecta)
            };
        });

        console.log('💾 Creando documento en MongoDB...');

        const nuevaPrueba = new PruebaDiagnostica({
            preguntas: preguntasProcesadas,
            creadoPor,
            nombreCreador
        });

        await nuevaPrueba.save();
        console.log('✅ Prueba guardada exitosamente:', nuevaPrueba._id);

        res.status(201).json({
            success: true,
            message: 'Prueba creada exitosamente',
            data: {
                id: nuevaPrueba._id,
                preguntas: nuevaPrueba.preguntas.length
            }
        });

    } catch (error) {
        console.error('❌ Error completo al crear prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
});

// ✅ 5. Obtener todas las pruebas (para admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const pruebas = await PruebaDiagnostica.find().sort({ fechaCreacion: -1 });

        res.json({
            success: true,
            data: pruebas
        });

    } catch (error) {
        console.error('Error al obtener pruebas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ✅ 6. Obtener prueba por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const prueba = await PruebaDiagnostica.findById(req.params.id);

        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: 'Prueba no encontrada'
            });
        }

        res.json({
            success: true,
            data: prueba
        });

    } catch (error) {
        console.error('Error al obtener prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ✅ 7. Eliminar prueba (desactivar)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const prueba = await PruebaDiagnostica.findById(req.params.id);
        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: 'Prueba no encontrada'
            });
        }

        prueba.activa = false;
        await prueba.save();

        res.json({
            success: true,
            message: 'Prueba eliminada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ✅ 8. Actualizar prueba
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { preguntas } = req.body;

        const prueba = await PruebaDiagnostica.findById(id);
        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: 'Prueba no encontrada'
            });
        }

        // Actualizar preguntas
        if (preguntas) {
            if (preguntas.length !== 5) {
                return res.status(400).json({
                    success: false,
                    message: 'La prueba debe tener exactamente 5 preguntas'
                });
            }

            const preguntasProcesadas = preguntas.map((pregunta, index) => {
                const opcionesProcesadas = pregunta.opciones.map((opcion, indexOpcion) => {
                    if (!opcion || opcion.trim() === '') {
                        throw new Error(`La opción ${indexOpcion + 1} de la pregunta ${index + 1} está vacía`);
                    }
                    return {
                        texto: opcion,
                        letra: String.fromCharCode(65 + indexOpcion)
                    };
                });

                return {
                    enunciado: pregunta.pregunta,
                    opciones: opcionesProcesadas,
                    respuestaCorrecta: String.fromCharCode(65 + pregunta.respuestaCorrecta)
                };
            });

            prueba.preguntas = preguntasProcesadas;
        }

        await prueba.save();

        res.json({
            success: true,
            message: 'Prueba actualizada exitosamente',
            data: prueba
        });

    } catch (error) {
        console.error('❌ Error al actualizar prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
});

module.exports = router;