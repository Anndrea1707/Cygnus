const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Usuario = require("./Usuario");

// =============================================
// MODELO DE PRUEBA DE CONOCIMIENTO
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

const pruebaConocimientoSchema = new mongoose.Schema({
    categoria: {
        type: String,
        required: [true, 'La categoría es requerida'],
        enum: ['matematicas', 'tecnologia', 'idiomas'],
        trim: true
    },
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

const PruebaConocimiento = mongoose.model('PruebaConocimiento', pruebaConocimientoSchema);

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

const verificarCategoriaMiddleware = async (req, res, next) => {
    try {
        const { categoria } = req.body;
        console.log('🔍 Verificando categoría:', categoria);

        if (!categoria) {
            return res.status(400).json({
                success: false,
                message: 'Categoría es requerida'
            });
        }

        const pruebaExistente = await PruebaConocimiento.findOne({
            categoria: categoria.toLowerCase(),
            activa: true
        });

        console.log('📊 Prueba existente encontrada:', pruebaExistente ? 'SÍ' : 'NO');

        if (pruebaExistente) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una prueba activa en la categoría ${categoria}. Solo se permite una prueba por categoría.`
            });
        }

        next();
    } catch (error) {
        console.error('❌ Error en verificarCategoriaMiddleware:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar categoría',
            error: error.message
        });
    }
};

// =============================================
// RUTAS PARA LA GESTIÓN DE PRUEBAS
// =============================================

// ✅ 1. Verificar si el usuario ya realizó la prueba
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
            categoriaInteres: usuario.encuesta_inicial?.area_interes,
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

// ✅ 2. Obtener prueba por categoría (para mostrar al usuario)
router.get("/obtener-por-categoria/:categoria", async (req, res) => {
    try {
        const prueba = await PruebaConocimiento.findOne({ 
            categoria: req.params.categoria,
            activa: true 
        });

        if (!prueba) {
            return res.status(404).json({ 
                success: false, 
                message: "No hay prueba disponible para esta categoría" 
            });
        }

        // No enviar las respuestas correctas al frontend
        const pruebaParaUsuario = {
            _id: prueba._id,
            categoria: prueba.categoria,
            preguntas: prueba.preguntas.map(p => ({
                enunciado: p.enunciado,
                opciones: p.opciones.map(op => ({
                    letra: op.letra,
                    texto: op.texto
                }))
            }))
        };

        res.json({
            success: true,
            prueba: pruebaParaUsuario
        });

    } catch (error) {
        console.error("Error al obtener prueba:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error del servidor" 
        });
    }
});

// ✅ 3. Calificar prueba y calcular habilidad
router.post("/calificar", async (req, res) => {
    try {
        const { usuarioId, pruebaId, respuestas } = req.body;

        // Obtener la prueba con respuestas correctas
        const prueba = await PruebaConocimiento.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ 
                success: false, 
                message: "Prueba no encontrada" 
            });
        }

        // Calificar respuestas
        let correctas = 0;
        respuestas.forEach((respuestaUsuario, index) => {
            const letraRespuesta = String.fromCharCode(65 + respuestaUsuario);
            if (letraRespuesta === prueba.preguntas[index].respuestaCorrecta) {
                correctas++;
            }
        });

        // Calcular puntuación (0-100)
        const puntuacion = (correctas / prueba.preguntas.length) * 100;

        // Calcular habilidad (1-5) basado en la puntuación
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
                "prueba_conocimiento.habilidad": habilidad,
                "prueba_conocimiento.categoria_evaluada": prueba.categoria
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

// ✅ 4. CREAR PRUEBA CON RESTRICCIÓN
router.post('/crear', authMiddleware, adminMiddleware, verificarCategoriaMiddleware, async (req, res) => {
    try {
        console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));

        const { categoria, preguntas } = req.body;
        const creadoPor = req.usuario.id;
        const nombreCreador = req.usuario.nombre;

        // Validar categoría
        const categoriasPermitidas = ['matematicas', 'tecnologia', 'idiomas'];
        if (!categoriasPermitidas.includes(categoria)) {
            return res.status(400).json({
                success: false,
                message: 'Categoría no válida. Use: matematicas, tecnologia, idiomas'
            });
        }

        // Validar número de preguntas
        if (!preguntas || preguntas.length !== 5) {
            return res.status(400).json({
                success: false,
                message: 'La prueba debe tener exactamente 5 preguntas'
            });
        }

        console.log('🔍 Procesando preguntas...');

        // Procesar preguntas con validación adicional
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

        const nuevaPrueba = new PruebaConocimiento({
            categoria: categoria.toLowerCase(),
            preguntas: preguntasProcesadas,
            creadoPor,
            nombreCreador
        });

        // Validar antes de guardar
        const erroresValidacion = nuevaPrueba.validateSync();
        if (erroresValidacion) {
            console.error('❌ Error de validación:', erroresValidacion);
            return res.status(400).json({
                success: false,
                message: 'Error de validación: ' + erroresValidacion.message
            });
        }

        await nuevaPrueba.save();
        console.log('✅ Prueba guardada exitosamente:', nuevaPrueba._id);

        res.status(201).json({
            success: true,
            message: 'Prueba creada exitosamente',
            data: {
                id: nuevaPrueba._id,
                categoria: nuevaPrueba.categoria,
                preguntas: nuevaPrueba.preguntas.length
            }
        });

    } catch (error) {
        console.error('❌ Error completo al crear prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ✅ 5. Verificar si ya existe prueba en la categoría
router.post('/verificar-categoria', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { categoria } = req.body;

        const pruebaExistente = await PruebaConocimiento.findOne({
            categoria: categoria.toLowerCase(),
            activa: true
        });

        res.json({
            success: true,
            existe: !!pruebaExistente,
            prueba: pruebaExistente
        });

    } catch (error) {
        console.error('Error al verificar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ 6. Obtener todas las pruebas
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { categoria, page = 1, limit = 10 } = req.query;

        const filtro = { activa: true };
        if (categoria) filtro.categoria = categoria.toLowerCase();

        const pruebas = await PruebaConocimiento.find(filtro)
            .sort({ fechaCreacion: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PruebaConocimiento.countDocuments(filtro);

        res.json({
            success: true,
            data: pruebas,
            paginacion: {
                paginaActual: parseInt(page),
                totalPaginas: Math.ceil(total / limit),
                totalPruebas: total
            }
        });

    } catch (error) {
        console.error('Error al obtener pruebas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ 7. Obtener prueba por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const prueba = await PruebaConocimiento.findById(id);

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
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ 8. Eliminar prueba (eliminación lógica)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Intentando eliminar prueba ID:', id);

        const prueba = await PruebaConocimiento.findById(id);
        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: 'Prueba no encontrada'
            });
        }

        prueba.activa = false;
        await prueba.save();

        console.log('✅ Prueba eliminada (desactivada) exitosamente:', id);

        res.json({
            success: true,
            message: 'Prueba eliminada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// ✅ 9. Actualizar prueba existente
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria, preguntas } = req.body;

        console.log('📝 Actualizando prueba ID:', id);
        console.log('📥 Datos recibidos:', JSON.stringify(req.body, null, 2));

        const prueba = await PruebaConocimiento.findById(id);
        if (!prueba) {
            return res.status(404).json({
                success: false,
                message: 'Prueba no encontrada'
            });
        }

        // Validar categoría si se está cambiando
        if (categoria && categoria !== prueba.categoria) {
            const categoriasPermitidas = ['matematicas', 'tecnologia', 'idiomas'];
            if (!categoriasPermitidas.includes(categoria)) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoría no válida. Use: matematicas, tecnologia, idiomas'
                });
            }

            // Verificar que no exista otra prueba en la nueva categoría
            const pruebaExistente = await PruebaConocimiento.findOne({
                categoria: categoria.toLowerCase(),
                activa: true,
                _id: { $ne: id }
            });

            if (pruebaExistente) {
                return res.status(400).json({
                    success: false,
                    message: `Ya existe una prueba activa en la categoría ${categoria}. Solo se permite una prueba por categoría.`
                });
            }

            prueba.categoria = categoria.toLowerCase();
        }

        // Actualizar preguntas si se proporcionan
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
        console.log('✅ Prueba actualizada exitosamente:', id);

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