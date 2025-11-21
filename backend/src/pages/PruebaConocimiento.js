const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Usuario = require("./Usuario");

// =============================================
// MODELO DE PRUEBA DIAGNÓSTICA ÚNICA
// =============================================

const opcionSchema = new mongoose.Schema({
    texto: { type: String, required: true, trim: true },
    letra: { type: String, required: true, enum: ["A", "B", "C", "D"] }
});

const preguntaSchema = new mongoose.Schema({
    enunciado: { type: String, required: true, trim: true },
    opciones: {
        type: [opcionSchema],
        validate: {
            validator: (opciones) => opciones.length === 4,
            message: "Cada pregunta debe tener exactamente 4 opciones"
        }
    },
    respuestaCorrecta: { type: String, required: true, enum: ["A", "B", "C", "D"] }
});

const pruebaDiagnosticaSchema = new mongoose.Schema({
    preguntas: {
        type: [preguntaSchema],
        validate: {
            validator: (preguntas) => preguntas.length === 5,
            message: "La prueba diagnóstica debe tener exactamente 5 preguntas"
        }
    },
    creadoPor: { type: String, required: true },
    nombreCreador: { type: String, default: "Administrador" },

    activa: { type: Boolean, default: true },

    intentosRealizados: { type: Number, default: 0 },
    promedioPuntaje: { type: Number, default: 0 },

    fechaCreacion: { type: Date, default: Date.now }
});

const PruebaDiagnostica = mongoose.model("PruebaDiagnostica", pruebaDiagnosticaSchema);

// =============================================
// MIDDLEWARE SIMULADO DE ADMIN
// =============================================

const authMiddleware = (req, res, next) => {
    req.usuario = {
        id: "admin-" + Date.now(),
        nombre: "Administrador"
    };
    next();
};

const adminMiddleware = (req, res, next) => next();

// =============================================
// RUTAS
// =============================================

// ------------------------------------------------
// 1. Verificar si el usuario ya hizo la prueba
// ------------------------------------------------
router.get("/estado/:usuarioId", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.usuarioId);

        if (!usuario) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        res.json({
            success: true,
            pruebaCompletada: usuario.prueba_conocimiento?.completada || false,
            habilidadActual: usuario.prueba_conocimiento?.habilidad || 1
        });

    } catch (error) {
        console.error("Error al verificar estado:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

// ------------------------------------------------
// 2. Obtener la única prueba diagnóstica
// ------------------------------------------------
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

// ------------------------------------------------
// 3. Calificar la prueba
// ------------------------------------------------
router.post("/calificar", async (req, res) => {
    try {
        const { usuarioId, pruebaId, respuestas } = req.body;

        const prueba = await PruebaDiagnostica.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ success: false, message: "Prueba no encontrada" });
        }

        let correctas = 0;
        respuestas.forEach((respuestaUsuario, index) => {
            const letra = String.fromCharCode(65 + respuestaUsuario);
            if (letra === prueba.preguntas[index].respuestaCorrecta) {
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

        prueba.intentosRealizados++;
        prueba.promedioPuntaje =
            (prueba.promedioPuntaje * (prueba.intentosRealizados - 1) + puntuacion)
            / prueba.intentosRealizados;

        await prueba.save();

        res.json({
            success: true,
            puntuacion,
            correctas: `${correctas}/${prueba.preguntas.length}`,
            habilidad,
            message: `¡Prueba completada! Tu habilidad es ${habilidad}`
        });

    } catch (error) {
        console.error("Error al calificar:", error);
        res.status(500).json({ success: false, message: "Error al calificar" });
    }
});

// ------------------------------------------------
// 4. Crear una prueba (solo si no existe otra activa)
// ------------------------------------------------
router.post("/crear", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const pruebaExistente = await PruebaDiagnostica.findOne({ activa: true });

        if (pruebaExistente) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una prueba diagnóstica activa. Debe eliminarla antes de crear otra."
            });
        }

        const { preguntas } = req.body;

        if (!preguntas || preguntas.length !== 5) {
            return res.status(400).json({
                success: false,
                message: "La prueba debe tener exactamente 5 preguntas"
            });
        }

        const preguntasProcesadas = preguntas.map((pregunta, idx) => ({
            enunciado: pregunta.pregunta,
            opciones: pregunta.opciones.map((op, i) => ({
                texto: op,
                letra: String.fromCharCode(65 + i)
            })),
            respuestaCorrecta: String.fromCharCode(65 + pregunta.respuestaCorrecta)
        }));

        const nuevaPrueba = new PruebaDiagnostica({
            preguntas: preguntasProcesadas,
            creadoPor: req.usuario.id,
            nombreCreador: req.usuario.nombre
        });

        await nuevaPrueba.save();

        res.status(201).json({
            success: true,
            message: "Prueba diagnóstica creada exitosamente",
            id: nuevaPrueba._id
        });

    } catch (error) {
        console.error("Error creando prueba:", error);
        res.status(500).json({ success: false, message: "Error interno" });
    }
});

// ------------------------------------------------
// 5. Eliminar (desactivar) la prueba
// ------------------------------------------------
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const prueba = await PruebaDiagnostica.findById(req.params.id);

        if (!prueba) {
            return res.status(404).json({ success: false, message: "Prueba no encontrada" });
        }

        prueba.activa = false;
        await prueba.save();

        res.json({ success: true, message: "Prueba eliminada correctamente" });

    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ success: false, message: "Error eliminando prueba" });
    }
});

// ------------------------------------------------
// 6. Actualizar prueba existente
// ------------------------------------------------
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const prueba = await PruebaDiagnostica.findById(req.params.id);

        if (!prueba) {
            return res.status(404).json({ success: false, message: "Prueba no encontrada" });
        }

        const { preguntas } = req.body;

        if (preguntas) {
            if (preguntas.length !== 5) {
                return res.status(400).json({
                    success: false,
                    message: "La prueba debe tener exactamente 5 preguntas"
                });
            }

            const preguntasProcesadas = preguntas.map((pregunta, index) => ({
                enunciado: pregunta.pregunta,
                opciones: pregunta.opciones.map((texto, i) => ({
                    texto,
                    letra: String.fromCharCode(65 + i)
                })),
                respuestaCorrecta: String.fromCharCode(65 + pregunta.respuestaCorrecta)
            }));

            prueba.preguntas = preguntasProcesadas;
        }

        await prueba.save();

        res.json({
            success: true,
            message: "Prueba actualizada correctamente"
        });

    } catch (error) {
        console.error("Error actualizando prueba:", error);
        res.status(500).json({ success: false, message: "Error interno" });
    }
});

module.exports = router;
