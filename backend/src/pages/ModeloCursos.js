// backend/src/pages/ModeloCursos.js
const mongoose = require("mongoose");

const contenidoSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String, 
        default: "" 
    },
    contenido: { 
        type: String, 
        required: true  // URL del video, documento, imagen, etc.
    },
    recursoExtra: { 
        type: String, 
        default: ""  // URL del recurso extra
    },
    recursoExtraPublicId: {
        type: String,
        default: ""  // public_id de Cloudinary para el recurso extra
    },
    tipoRecurso: {
        type: String,
        enum: ["url", "archivo"],
        default: "url"
    }
}, { _id: true });

const preguntaSchema = new mongoose.Schema({
    interrogante: { 
        type: String, 
        required: true 
    },
    opciones: [{ 
        type: String, 
        required: true 
    }],
    opcionCorrecta: { 
        type: String, 
        required: true  // Índice de la opción correcta (0-3)
    },
    dificultad: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    }
}, { _id: true });

const evaluacionSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        default: "" 
    },
    descripcion: { 
        type: String, 
        default: "" 
    },
    preguntas: [preguntaSchema]
}, { _id: true });

const moduloSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String, 
        default: "" 
    },
    imagenPortada: { 
        type: String, 
        default: ""  // URL de la imagen de portada
    },
    imagenPortadaPublicId: {
        type: String,
        default: ""  // public_id de Cloudinary para la imagen de portada
    },
    cantidadContenido: { 
        type: String, 
        default: "" 
    },
    contenido: [contenidoSchema],
    evaluacion: evaluacionSchema
}, { _id: true });

const cursoSchema = new mongoose.Schema(
    {
        nombre: { 
            type: String, 
            required: true,
            trim: true
        },
        descripcion: { 
            type: String, 
            required: true 
        },
        imagen: { 
            type: String, 
            required: true  // URL de la imagen principal
        },
        imagenPublicId: { 
            type: String, 
            default: ""  // public_id de Cloudinary para la imagen principal
        },
        fechaPublicacion: { 
            type: Date, 
            default: Date.now 
        },
        horasEstimadas: { 
            type: Number, 
            required: true,
            min: 0
        },
        nivel: { 
            type: String, 
            required: true,
            enum: ["básico", "intermedio", "avanzado"]
        },
        categoria: { 
            type: String, 
            required: true,
            enum: ["Matemáticas", "Tecnología", "Idiomas"]
        },
        
        // Módulos del curso (máximo 4)
        modulos: [moduloSchema],
        
        // Evaluación final del curso
        evaluacionFinal: evaluacionSchema,

        // Metadatos adicionales
        estado: {
            type: String,
            enum: ["activo", "inactivo", "borrador"],
            default: "activo"
        },
        
        creadoPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario"
        },
        
        actualizadoEn: { 
            type: Date, 
            default: Date.now 
        },

        // Estadísticas del curso
        estadisticas: {
            estudiantesInscritos: { 
                type: Number, 
                default: 0 
            },
            calificacionPromedio: { 
                type: Number, 
                default: 0,
                min: 0,
                max: 5
            },
            totalCompletados: { 
                type: Number, 
                default: 0 
            }
        }

    },
    { 
        collection: "cursos",
        timestamps: true // Agrega createdAt y updatedAt automáticamente
    }
);

// Índices para mejor performance
cursoSchema.index({ nombre: "text", descripcion: "text" });
cursoSchema.index({ categoria: 1, nivel: 1 });
cursoSchema.index({ estado: 1 });

// Middleware para actualizar la fecha de actualización
cursoSchema.pre("save", function(next) {
    this.actualizadoEn = Date.now();
    next();
});

// Método para validar la evaluación final (20 preguntas, 4 por dificultad)
cursoSchema.methods.validarEvaluacionFinal = function() {
    if (!this.evaluacionFinal || !this.evaluacionFinal.preguntas) {
        return false;
    }
    
    const preguntas = this.evaluacionFinal.preguntas;
    if (preguntas.length !== 20) {
        return false;
    }
    
    const dificultades = {1:0, 2:0, 3:0, 4:0, 5:0};
    preguntas.forEach(pregunta => {
        if (pregunta.dificultad >= 1 && pregunta.dificultad <= 5) {
            dificultades[pregunta.dificultad]++;
        }
    });
    
    for (let i = 1; i <= 5; i++) {
        if (dificultades[i] !== 4) {
            return false;
        }
    }
    
    return true;
};

// Método para contar el total de contenido del curso
cursoSchema.methods.obtenerTotalContenido = function() {
    let total = 0;
    this.modulos.forEach(modulo => {
        total += modulo.contenido.length;
    });
    return total;
};

// Método para obtener la duración estimada en formato legible
cursoSchema.methods.obtenerDuracionFormateada = function() {
    if (this.horasEstimadas < 1) {
        return `${Math.round(this.horasEstimadas * 60)} minutos`;
    } else if (this.horasEstimadas === 1) {
        return "1 hora";
    } else {
        return `${this.horasEstimadas} horas`;
    }
};

// ✅ Exportar correctamente el modelo
const Curso = mongoose.model("Curso", cursoSchema);
module.exports = Curso;